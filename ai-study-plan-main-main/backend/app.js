require('dotenv').config(); // Load .env first

const express = require('express');
const exphbs = require('express-handlebars');
const cors = require('cors');
const path = require('path');
const { HfInference } = require("@huggingface/inference");
const admin = require('firebase-admin');

const app = express();
const port = 3001;

// Setup Firebase
const serviceAccount = require(process.env.FIREBASE_KEY_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Setup Views and Middleware
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Hugging Face inference setup
const inference = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Fallback Plan Generator
function generateFallbackPlan(subject, level, duration, goals) {
    const durationWeeks = parseInt(duration.match(/\d+/)) || 4;
    const weeksText = durationWeeks > 1 ? 'weeks' : 'week';

    return `Study Plan for ${subject} (${level} Level)
Duration: ${duration}
Goals: ${goals}

=== STUDY PLAN OVERVIEW ===

Phase 1: Foundation (Week 1${durationWeeks > 2 ? '-2' : ''})
- Review fundamental concepts
- Gather materials
- Establish routine (1-2 hrs/day)
- Do basic exercises

Phase 2: Core Learning (Week ${durationWeeks > 2 ? '3-' + Math.ceil(durationWeeks * 0.7) : '2'})
- Deep dive into core topics
- Practice problem-solving
- Create notes/mind maps

Phase 3: Advanced Application (Week ${Math.ceil(durationWeeks * 0.7) + 1}-${durationWeeks - 1})
- Complex topics + real-world use
- Case studies and scenarios
- Integration of topics

Phase 4: Review & Mastery (Final Week)
- Final revision
- Mock tests
- Confidence boosting

=== DAILY STRUCTURE ===

Morning: Recap previous, prep new (~30 min)
Midday: Learn/practice new (~60–90 min)
Evening: Summarize & plan (~15 min)

=== WEEKLY MILESTONES ===

Week 1: Foundation
Week 2: Core modules
${durationWeeks > 2 ? 'Week 3: Applications\n' : ''}${durationWeeks > 3 ? 'Week 4: Mastery\n' : ''}Final Week: Goal ready!

Tips:
- Use Pomodoro
- Review often
- Join groups / Ask questions
- Be consistent

(This is a fallback plan when AI is unavailable.)`;
}

// Endpoint: Model Status
app.get('/check-models', async (req, res) => {
    const models = [
        "mistralai/Mistral-7B-Instruct-v0.3",
        "microsoft/DialoGPT-medium",
        "google/flan-t5-large",
        "facebook/blenderbot-400M-distill",
        "bigscience/bloom-560m"
    ];

    const modelStatus = {};

    for (const model of models) {
        try {
            await inference.textGeneration({
                model: model,
                inputs: "Hello",
                parameters: { max_new_tokens: 5 }
            });
            modelStatus[model] = "Available";
        } catch (error) {
            modelStatus[model] = `Unavailable: ${error.message}`;
        }
    }

    res.json({ timestamp: new Date().toISOString(), modelStatus });
});

// Endpoint: Generate Plan
app.post('/generate-plan', async (req, res) => {
    const { subject, level, duration, goals } = req.body;

    if (!subject || !level || !duration || !goals) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const prompt = `Create a personalized study plan:

Subject: ${subject}
Level: ${level}
Duration: ${duration}
Goals: ${goals}

Include:
1. Overview
2. Weekly breakdown
3. Daily study schedule
4. Milestones
5. Assessments
6. Resources
7. Learning tips`;

    const models = [
        "mistralai/Mistral-7B-Instruct-v0.3",
        "microsoft/DialoGPT-medium",
        "google/flan-t5-large",
        "facebook/blenderbot-400M-distill",
        "bigscience/bloom-560m"
    ];

    let lastError = null;
    let modelUsed = null;

    for (const model of models) {
        try {
            const response = await inference.textGeneration({
                model: model,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 2000,
                    temperature: 0.7,
                    top_p: 0.95,
                    repetition_penalty: 1.15,
                    do_sample: true
                }
            });

            if (response?.generated_text && response.generated_text.length >= 100) {
                let generatedText = response.generated_text.replace(prompt, '').trim();
                modelUsed = model;

                const studyPlanRef = await db.collection('studyPlans').add({
                    subject, level, duration, goals,
                    plan: generatedText,
                    modelUsed,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isAiGenerated: true
                });

                return res.json({
                    success: true,
                    plan: generatedText,
                    planId: studyPlanRef.id,
                    modelUsed,
                    isAiGenerated: true
                });
            }

        } catch (error) {
            lastError = error;
        }
    }

    const fallbackPlan = generateFallbackPlan(subject, level, duration, goals);

    try {
        const fallbackRef = await db.collection('studyPlans').add({
            subject, level, duration, goals,
            plan: fallbackPlan,
            modelUsed: 'fallback',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isAiGenerated: false
        });

        return res.json({
            success: true,
            plan: fallbackPlan,
            planId: fallbackRef.id,
            modelUsed: 'fallback',
            isAiGenerated: false,
            message: 'AI service unavailable, fallback used'
        });
    } catch (error) {
        return res.json({
            success: true,
            plan: fallbackPlan,
            modelUsed: 'fallback',
            isAiGenerated: false,
            warning: 'Fallback plan not saved due to DB error'
        });
    }
});

// Endpoint: Get All Plans
app.get('/study-plans', async (req, res) => {
    try {
        const snapshot = await db.collection('studyPlans')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const plans = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));

        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint: Get Plan by ID
app.get('/study-plan/:id', async (req, res) => {
    try {
        const doc = await db.collection('studyPlans').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Not found' });
        }

        res.json({ success: true, plan: { id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        server: 'study-plan-generator',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Catch-all 404
app.use('*', (req, res) => {
    res.status(404).json({ success: false, error: 'Not found' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
