// fetch('navbar.html')
//             .then(response => response.text())
//             .then(data => {
//                 document.getElementById('navbar').innerHTML = data;
//             })
//             .catch(error => {
//                 console.error('Error loading the navbar:', error);
//             });
           
        

            fetch('sidenav.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('sidenav').innerHTML = data;
            })
            .catch(error => {
                console.error('Error loading the side navbar:', error);
            });
           
        