
/* LEARNING FROM MACHINES - EXAMPLE CODE 
 * --------------------------------------
 *
 * Code Snippets created during the Intelligence of SiIly Walks project 
 * by CIRG (https://cirg.io) and Space10 (https://space10.io/)
 *  
 * Project URL:
 * Code Snippet Repository:  
 *  
 * Example Using openPosNet and ml5.js in p5.js 
 * Based on ml5.js examples: https://github.com/ml5js/ml5-examples  
 * 
 * Licensed under the GNU Lesser General Public License. See license.txt for further details.
 * 
 * CIRG + Space10 | Summer 2019 |
 * 
 */


function startPrediction(){
  doPrediction = true;  
  if(consoleDebug)console.log('start prediction');
  if(drawDomDebug)select('#status').html('start prediction')
}


// Clear the examples in one label
function clearLabel(classLabel) {
  knnClassifier.clearLabel(classLabel);
  updateCounts();
}

// Clear all the examples in all labels
function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}

function saveModel() {
  if(consoleDebug)console.log('saving knnClassifier');
  knnClassifier.save('knn_model_' + getTimeStamp());
 if(drawDomDebug)select('#status').html('knnClassifier model saved')
}

function loadDataset(_name) {
  knnClassifier.load('./assets/' + _name + '.json', updateCounts);
  if(consoleDebug)console.log('loaded knnClassifier');
  if(drawDomDebug)select('#status').html('knnClassifier model loading')
}

/*function loadDataset(_modelNr) {
  knnClassifier.load('./assets/model_' + _modelNr + '.json', updateCounts);
  if(consoleDebug)console.log('loaded knnClassifier');
  if(drawDomDebug)select('#status').html('knnClassifier model loading')
}*/


// Add the current frame from the video to the classifier
function addExample(label) {
  
  if( poses.length > 0) {
    // Convert poses results to a 2d array [[score0, x0, y0],...,[score16, x16, y16]]
    var poseArray = poses[selectedPosId].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);

    // Add an example with a label to the classifier
    knnClassifier.addExample(poseArray, label);
    updateCounts();
    //console.log("test");
  }
}


function modelReady(){
  //select('#status').html('openPosNet Model Loaded')
}



// Predict the current frame.
function classify() {
  
  // Get the total number of labels from knnClassifier
  var numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  // Convert poses results to a 2d array [[score0, x0, y0],...,[score16, x16, y16]]
  //const poseArray = poses[0].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);
  if( poses.length > 0) {
    var poseArray = poses[selectedPosId].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);
    
    // Use knnClassifier to classify which label do these features belong to
    // You can pass in a callback function `gotResults` to knnClassifier.classify function
    //knnClassifier.classify(poseArray, gotResults);
    knnClassifier.classify(poseArray, gotResults);
    waitingForResult = true;
  } else {
     if(consoleDebug)console.log("no pose to classify");
  }

}


// Show the results
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    var confidences = result.confidencesByLabel;
    // result.label is the label that has the highest confidence
    if (result.label) {
      if(drawDomDebug)select('#result').html(result.label);
      if(drawDomDebug)select('#confidence').html(`${confidences[result.label] * 100} %`);
    }
     // make results globally available
    for (let e = 0; e < classId.length; e++) {
      if(trainingView)select('#confidence'+classId[e]).html(`${confidences[classId[e]] ? confidences[classId[e]] * 100 : 0} %`);
      // make results globally available
      confLevels[e] = (confidences[classId[e]] * 100);
    }  
    
  }

  // not waiting for the result anymore
  waitingForResult = false;
}


// Update the example count for each label  
function updateCounts() {
  var counts = knnClassifier.getCountByLabel();

  for (let e = 0; e < classId.length; e++) {
     if(trainingView)select('#example'+classId[e]).html(counts[classId[e]] || 0);
  }
}