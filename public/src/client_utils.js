function sendData(data, url, success_callback, error_callback) {
    var XHR = new XMLHttpRequest();
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];
    var name;
  
    // Transformez l'objet data en un tableau de paires clé/valeur codées URL.
    for(name in data) {
      urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    }
  
    // Combinez les paires en une seule chaîne de caractères et remplacez tous
    // les espaces codés en % par le caractère'+' ; cela correspond au comportement
    // des soumissions de formulaires de navigateur.
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
  
    // Définissez ce qui se passe en cas de succès de soumission de données
    XHR.addEventListener('load', function(event) {
      if(success_callback) {
          success_callback(event.currentTarget.response);
      }
    });
  
    // Définissez ce qui arrive en cas d'erreur
    XHR.addEventListener('error', function(event) {
        if(error_callback) {
            error_callback();
        }
    });
  
    // Configurez la requête
    XHR.open('POST', url);
  
    // Ajoutez l'en-tête HTTP requise pour requêtes POST de données de formulaire
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  
    // Finalement, envoyez les données.
    XHR.send(urlEncodedData);
}

function changePageSmooth(destination) {
  let form = document.getElementsByClassName("center")[0];
  form.classList.add("exiting");
  document.body.classList.remove("running_gradient");
  document.body.classList.add("paused_gradient");
  setTimeout(() => {
    window.location.href = destination;
  }, 500)
}