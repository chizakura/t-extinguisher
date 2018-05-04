// Global variables
var uid = location.href.match(/uid=(.+)/)[1];
var db = firebase.database().ref('Users/' + uid);
var storage = firebase.storage();
/*
 ** Helper function to: dbResult
 */
function retrieveFrom(path, callback, after) {
    firebase.database().ref(path).once('value', function(snap) {
        callback(snap.val());
    }).then(function() {
        after();
    });
}

function dbResult(path, result, after) {
    retrieveFrom(path, function(data) {
        $.each(data, function (index, item) {
            result(index, item);
        });
    }, function() {
        /*
        * commented to avoid unchecked exception.
        */
        //after();
    });
}
// Get member's name
function getMemberName() {
    var name = db.once("value").then(function(snapshot) {
        var name = snapshot.child("Name").val();
        return name;
    });
    return name;
}
// Get member's email
function getMemberEmail() {
    var email = db.once("value").then(function(snapshot) {
        var email = snapshot.child("Email").val();
            return email;
    });
    return email;
}
// Get member's profile id
function getMemberProfileID() {
    var pid = db.once("value").then(function(snapshot) {
        var pid = snapshot.child("ProfileID").val();
            return pid;
    });
    return pid;
}
// Get member's profile picture
function getMemberPhotoUrl() {
    var gsRef = storage.refFromURL('gs://t-extinguisher.appspot.com/no-avatar.png');
    var checkPhoto = db.once("value").then(function(snapshot) {
        return snapshot.child("Photo").exists();
    });

    if(checkPhoto == true) {
        db.once("value").then(function(snapshot) {
            var url = snapshot.child("Photo").val();
            var img = document.getElementById('m-picture');
                img.src = url;
        });
    } else {
        gsRef.getDownloadURL().then(function(url) {
        var img = document.getElementById('m-picture');
            img.src = url;
        }).catch(function(error) {
        // Handle any errors
        });
    }
}
// Helper functions to: calculateScore
function common (avg, min, max) {
    return (avg >= min) && (avg <= max);
}
// Get overall score of member
function calculateMemberScore() {
    dbResult('/Ratings/', function(key,value) {
        var pid = key;
        var arr = [];
        var A = 0.8;
        var B = 0.9;
        var z = 1 - Math.pow(Math.E,-1);
        
        getMemberProfileID().then(function(idValue){
            if(pid == idValue) {
                $.each(value, function(userAttr, val){
                    arr.push(val);
                });

                const reducer = (accumulator, currentValue) => accumulator + currentValue;
                var sum = arr.reduce(reducer);
                var avg = sum / arr.length;

                if(common(avg, 4, 10)) {
                    var scoreA = (A * avg + 10 * (1-A) * z).toFixed(2);
                    $('p.m-overallScore').append(' ' + scoreA);
                } else if (common(avg, 0, 4)) {
                    var scoreB = (A * avg + 10 * (1-B) * z).toFixed(2);
                    $('p.m-overallScore').append(' ' + scoreB);
                } else {
                    $('p.m-overallScore').append(' ' + sum);
                }
            }
        }, function(){
            // if you need an additional callback function it should be here I believe
        });
    });
}
// Get comments from database
function getComments() {
    getMemberProfileID().then(function(mpid) {
        dbResult('/Comments/' + mpid, function(key,value) {
            $('#comment-body div.panel-body').append('<div class="well well-sm">' + 
                '<strong class="primary-font" id="postName' + key + '"></strong>' + 
                '<small class="pull-right text-muted" id="postTime' + key + '"></small>' + 
                '<p id="postMessage' + key + '"></p></div>');
            
            $.each(value, function(attr, val) {
                if (attr === 'name') {
                    $('#postName' + key).text(val);
                } else if (attr === 'postedAt') {
                    $('#postTime' + key).append('<i class="fa fa-clock-o fa-fw"></i>' + val);
                } else if (attr === 'message') {
                    $('#postMessage' + key).text(val);
                }
            });
        });
    });
}