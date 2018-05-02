// Get member's name
function getMemberName() {
    var uid = location.href.match(/uid=(.+)/)[1];
    var ref = firebase.database().ref('Users/' + uid);
    var name = ref.once("value").then(function(snapshot) {
        var name = snapshot.child("Name").val();
        return name;
    });
    return name;
}
// Get member's email
function getMemberEmail() {
    var uid = location.href.match(/uid=(.+)/)[1];
    var ref = firebase.database().ref('Users/' + uid);
    var email = ref.once("value").then(function(snapshot) {
        var email = snapshot.child("Email").val();
            return email;
    });
    return email;
}
// Get member's profile id
function getMemberProfileID() {
    var uid = location.href.match(/uid=(.+)/)[1];
    var ref = firebase.database().ref('Users/' + uid);
    var pid = ref.once("value").then(function(snapshot) {
        var pid = snapshot.child("ProfileID").val();
            return pid;
    });
    return pid;
}
// Get member's overall score
function getMemberOverallScore() {
    var uid = location.href.match(/uid=(.+)/)[1];
    var ref = firebase.database().ref('Users/' + uid);
    var score = ref.once("value").then(function(snapshot) {
        var score = snapshot.child("Overall").val();
            return score;
    });
    return score;
}