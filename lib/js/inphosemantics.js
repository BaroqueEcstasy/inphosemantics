function main() {
  $.getJSON("../../data/inphosemantics-directory.json",
            function(response) {

              // hides 'Make Selections' modal on load
              $("#selectionModal").modal({
                show: false
              });

              var dir = response;

              // 'global' corpora variables
              var corporaArray = dir['responseData']['results'][0]['corpora'];
              var corporaLength = corporaArray.length;


              // 'global' models variables
              var modelsArray = [];
              var modelsLength = 0;

              // returns a corpus' dictionary key
              function getCorpusKey(corpus) {
                return Object.keys(corpus)[0];
              }

              // returns a model's dictionary key
              function getModelKey(model) {
                return Object.keys(model)[0];
              }

              // returns a corpus' 'long label' given its dictionary key
              function getCorpusLongLabel(corpusKey) {
                for (var i=0; i<corporaLength; i++) {
                  var keys = Object.keys(corporaArray[i]);
                  if (keys.indexOf(corpusKey) != -1) {
                    return corporaArray[i][corpusKey]['long label'];
                  }
                }
                alert('Corpus key not found.')
              }

              // returns a model's 'long label' given its dictionary key
              function getModelLongLabel(modelKey) {
                for (var i=0; i<modelsLength; i++) {
                  var keys = Object.keys(modelsArray[i]);
                  if (keys.indexOf(modelKey) != -1) {
                    return modelsArray[i][modelKey]['long label'];
                  }
                }
                alert('Model key not found.')
              }

              // populates 'modelsArray' with all of the models
              // TODO: make array a set
              for (var i=0; i<corporaLength; i++) {
                var corpus = corporaArray[i];
                var corpusKey = getCorpusKey(corpus);
                var models = corpus[corpusKey]['models'];
                for (var j=0; j<models.length; j++) {
                  var model = models[j];
                  modelsArray.push(model);
                }
              }

              // now that 'modelsArray' has been populated, modelsLength can be updated
              modelsLength = modelsArray.length;

              // populates the 'Add Corpus' modal
              for (var i=0; i<corporaLength; i++) {
                var corpus = corporaArray[i];
                var corpusKey = getCorpusKey(corpus);
                $("#corporaSelect").append("<option value='"+corpusKey+"'>"+getCorpusLongLabel(corpusKey)+"</option>");
              }

              // populates the 'Add Model' modal
              for (var i=0; i<modelsLength; i++) {
                var model = modelsArray[i];
                var modelKey = getModelKey(model);
                $("#modelsSelect").append("<option value='"+modelKey+"'>"+getModelLongLabel(modelKey)+"</option>");
              }

              // adds the selected corpus to the URL
              $("#corporaSubmit").click(function(event) {
                event.preventDefault();
                var selectedCorpus = $("#corporaSelect").val();
                var selectedCorpora = convertHashToObject(window.location.hash)['corpora'];

                // if hashObject does not already contain the selected corpus
                if (selectedCorpora.indexOf(selectedCorpus) == -1) {
                  addCorpus(selectedCorpus);

                  var anchor = "<a id=\'" + selectedCorpus + "\'class='close' style='float: none; vertical-align: text-bottom;'>&times;</a>";
                  var listItem = "<li id=\'" + selectedCorpus + "li\'>" + getCorpusLongLabel(selectedCorpus) + anchor + "</li>";

                  $("#currentCorpora").append(listItem);

                  document.getElementById(selectedCorpus).onclick = function(){
                    return function(){
                      removeCorpus(selectedCorpus);
                      var li = document.getElementById(selectedCorpus + "li");
                      $(li).remove();
                    };
                  }();

                }
              });

              // adds the selected model to the URL
              $("#modelsSubmit").click(function(event) {
                event.preventDefault();
                var selectedModel = $("#modelsSelect").val();
                var hashModels = convertHashToObject(window.location.hash)['models'];

                // if hashObject does not already contain the selected model
                if (hashModels.indexOf(selectedModel) == -1) {
                  addModel(selectedModel);

                  var anchor = "<a id=\'" + selectedModel + "\' class='close' style='float: none; vertical-align: text-bottom;'>&times;</a>";
                  var listItem = "<li id=\'" + selectedModel + "li\'>" + getModelLongLabel(selectedModel) + anchor + "</li>";

                  $("#currentModels").append(listItem);

                  document.getElementById(selectedModel).onclick = function(){
                    return function(){
                      removeModel(selectedModel);
                      var li = document.getElementById(selectedModel + "li");
                      $(li).remove();
                    };
                  }();

                }
              });

              // adds the searched phrase to the URL
              $("#search").submit(function(event) {
                event.preventDefault();
                var searchedPhrase = $("#searchTerm").val();
                var searchedPhrases = convertHashToObject(window.location.hash)['phrases'];

                // if hashObject does not already contain the search phrase.
                if (searchedPhrases.indexOf(searchedPhrase) == -1) {
                  addPhrase(searchedPhrase);

                  var anchor = "<a id=\'" + searchedPhrase +"\'class='close' style='float: none; vertical-align: text-bottom;'>&times;</a>";
                  var listItem = "<li id=\'" + searchedPhrase + "li\'>" + searchedPhrase + anchor +"</li>";

                  $("#currentPhrases").append(listItem);

                  document.getElementById(searchedPhrase).onclick = function(){
                    return function(){
                      removePhrase(searchedPhrase);
                      var li = document.getElementById(searchedPhrase + "li");
                      $(li).remove();
                    };
                  }();

                }
                this.reset();
              });

              // ensures that "current selection" data persists on refresh
              // TODO: implement 'long labels'
              var hash = window.location.hash;
              var obj = convertHashToObject(hash);

              var hashCorpora = obj['corpora'];
              if (hashCorpora){
                for (var i=0; i<hashCorpora.length; i++) {
                  $("#currentCorpora").append("<li>"+getCorpusLongLabel(hashCorpora[i])+" <a class='close' style='float: none; vertical-align: text-bottom;'>&times;</a></li>");
                }
              }

              var hashModels = obj['models'];
              if (hashModels){
                for (var i=0; i<hashModels.length; i++) {
                  $("#currentModels").append("<li>"+getModelLongLabel(hashModels[i])+" <a class='close' style='float: none; vertical-align: text-bottom;'>&times;</a></li>");
                }
              }

              var hashPhrases = obj['phrases'];
              if (hashPhrases){
                for (var i=0; i<hashPhrases.length; i++) {
                  $("#currentPhrases").append("<li>"+hashPhrases[i]+" <a class='close' style='float: none; vertical-align: text-bottom;'>&times;</a></li>");
                }
              }

              function renderTable(corpora, models, phrases) {
                $("#root").css("display", "table");

                for (var i=0; i<corpora.length; i++) {
                  var corpus = corpora[i];
                  $("#root > tbody > tr").append(
                    "<td><table class='table' id='"+corpus+"'><thead><tr><th colspan='"+models.length+"' style='text-align: center;'>"+getCorpusLongLabel(corpus)+"</th></tr></thead><tbody><tr></tr></tbody></table></td>"
                  );
                }

                $("#root > tbody > tr > td > table > tbody > tr").each(function() {
                  for (var i=0; i<models.length; i++) {
                    var model = models[i];
                    $(this).append(
                      "<td><table class='table' id='"+$(this).closest("table").attr("id")+":"+model+"'><thead><tr><th colspan='"+phrases.length+"' style='text-align: center;'>"+getModelLongLabel(model)+"</th></tr></thead><tbody><tr></tr></tbody></table></td>"
                    );
                  }
                });

                $("#root > tbody > tr > td > table > tbody > tr > td > table > tbody > tr").each(function() {
                  for (var i=0; i<phrases.length; i++) {
                    var phrase = phrases[i];
                    $(this).append(
                      "<td><table class='table' id='"+$(this).closest("table").attr("id")+":"+phrase+"'><thead><tr><th colspan='2' style='text-align: center;'>"+phrase+"</th></tr><tr><th>Phrase</th><th>Similarity</th></tr></thead><tbody></tbody></table></td>"
                    );
                  }
                });
              }

              function selectColumn(corpus, model, phrase){
                var id = corpus+":"+model+":"+phrase;
                var elem = document.getElementById(id);
                return elem;
              }

              var termArray = [{"hume": 0.91794278932365247}, {"leibniz": 0.88537851050795435}, {"herder": 0.8753212567380434}, {"aristotle": 0.87024416994341403}, {"spinoza": 0.85926509164300868}, {"locke": 0.85888683236409924}, {"hegel": 0.85849343284862778}, {"wolff": 0.85748667120495348}, {"bradley": 0.84722366230370616}, {"strawson": 0.84458059258174023}, {"reid": 0.84188141318227327}, {"cohen": 0.83685662225276858}, {"mill": 0.83652194554221815}, {"maimon": 0.83544172029147257}, {"newton": 0.8344075826950208}, {"quine": 0.83245172505995968}, {"plato": 0.832291917065342}, {"frege": 0.83002595290102388}, {"views": 0.82937957386278915}, {"fichte": 0.82539844268173246}];

              /** RENDERCOLUMN : Array<Pair> data, DOMobject element
               * populates a dom object [tbody] with table rows and table data
               * from the data array received.
               **/
              function renderColumn(data, element){
                // for each pair in the dataArray
                for(var i = 0; i < data.length; i++){
                  // for each (only one) key in the object pair
                  for(key in data[i]){
                    // append this data to the parentObject as a related term and similarity
                    $(element).append("<tr><td>"+key+"</td><td>"+data[i][key]+"</td></tr>");
                  }
                }
              }

              function xml_http_post(url, data, callback) {
                console.log("Posting request");
                var req = false;

                try {
                  // Chrome, Firefox, Opera 8.0+, Safari
                  req = new XMLHttpRequest();
                }
                catch (e1) {
                  // Internet Explorer
                  try {
                    req = new ActiveXObject("Msxml2.XMLHTTP");
                  }
                  catch (e2) {
                    try {
                      req = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                    catch (e3) {
                      alert("Your browser does not support AJAX!");
                      return false;
                    }
                  }
                }
                req.open("POST", url, true);
                req.onreadystatechange = function() {
                  if (req.readyState == 4) {
                    callback(req);
                  }
                }
                req.send(data);
              }

              $("#querySubmit").click(function(){
                $("#root tr").empty();
                var hashObj = convertHashToObject( window.location.hash );
                var corpora = hashObj['corpora'];
                var models = hashObj['models'];
                var phrases = hashObj['phrases'];

                // draw the empty table
                renderTable(corpora, models, phrases);
                
                // create a request for each combination
                for(var ci = 0; ci < corpora.length; ci++){
                  for(var mi = 0; mi < models.length; mi++){
                    for(var pi = 0; pi < phrases.length; pi++){
                      // construct request data
                      var requestData = {
                        "corpus":corpora[ci],
                        "model":models[mi],
                        "phrase":phrases[pi]
                      };

                      var requestDataTxt = JSON.stringify(requestData);

                      // Determine where to render the response data.
                      var parentColumn = selectColumn(corpora[ci], models[mi], phrases[pi]);

                      // Construct a callback function for this column element.
                      var callback = function(parent){
                        return function(response){
                          
                          // If text comes back ...
                          if(response){
                            // parse it into an array and render the data.
                            var data = JSON.parse(response['response']);                            
                            renderColumn(data, parent);
                          }
                        };
                      }(parentColumn);

                      // Send the request.
                      xml_http_post("index.html", requestDataTxt, callback);
                    }
                  }
                }
                $("#selectionModal").modal('hide');
              });

              // TODO: very crudely implemented
              $("#queryReset").click(function(){
                window.location.hash = "";
                window.location.reload();
              });
            });
}

$(document).ready(function(){
  main();
});

