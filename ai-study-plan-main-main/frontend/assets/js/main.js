document.getElementById('studyPlanForm').addEventListener('submit', async function (e) { 
    e.preventDefault();
    const submitButton = document.getElementById('submitButton');
    const studyPlanDiv = document.getElementById('studyPlan');
    const form = this;

    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading-dots">Generating</span>';
    studyPlanDiv.innerHTML = '<span class="loading-dots">Generating your study plan</span>';

    const subject = document.getElementById('subject').value;
    const level = document.getElementById('level').value;
    const duration = document.getElementById('duration').value;
    const goals = document.getElementById('goals').value;

    try {
        const response = await fetch('http://localhost:3001/generate-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subject, level, duration, goals }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("Received data:", data);

        if (data.plan) {
            const formattedPlan = formatStudyPlan(data.plan);
            studyPlanDiv.innerHTML = formattedPlan;
            form.reset();
        } else if (data.error) {
            studyPlanDiv.innerHTML = `<p class="error">Error: ${data.error}</p>`;
            if (data.details) {
                studyPlanDiv.innerHTML += `<p>Details: ${data.details}</p>`;
            }
        } else {
            studyPlanDiv.textContent = 'Received an empty response. Please try again.';
        }
    } catch (error) {
        console.error('Error fetching study plan:', error);
        studyPlanDiv.innerHTML = `<p class="error">Failed to generate study plan. Please try again.</p><p>Error: ${error.message}</p>`;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Generate Study Plan';
    }
});

function formatStudyPlan(plan) {
    let formattedPlan = plan.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedPlan = formattedPlan.replace(/\n/g, '<br>');
    return formattedPlan;
}