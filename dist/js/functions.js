var $uid = '';
initialCheck();

$('#forgotpw').click(function(e) {
	e.preventDefault();
	sendPasswordReset(firebase.auth().currentUser.email);
});

$('#signout').click(function(e) {
	e.preventDefault();
	signOutUser();
});

function initialCheck() {
	firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function() {
	  // Existing and future Auth states are now persisted in the current
	  // session only. Closing the window would clear any existing state even
	  // if a user forgets to sign out.
	  // ...
	  // New sign-in will be persisted with session persistence.
	  return firebase.auth().signInWithEmailAndPassword(email, password);
	}).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	});

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			$uid = getUID();
			// User is signed in and currentUser will no longer return null.
			if (location.href.indexOf('login.html') !== -1 || location.href.indexOf('registration.html') !== -1) {
				window.location.href = 'index.html?logged_in';
			} else if (location.href.indexOf('profile.html') !== -1) {
				// Get name of current user from database
				getName().then(function(value){
					$('p.p-name').append(' ' + value);
				});
				// Get email of current user from database
				$('p.p-email').append(' ' + getEmail());
				// Get profile ID of current user from database
				getProfileID().then(function(value){
					$('p.p-profileid').append(' ' + value);
				});
				// Get user ID from database
				$('p.p-uid').append(' ' + getUID());
				// Get overall score of current user from database
				calculateScore();
				// Get photo url of current user
				getPhotoUrl();
				// List all ratings of current user
				getUserRatings();
			}

			if (!user.emailVerified) {
				sendEmailVerification();
			}

		} else {
			// No user is signed in.
			if(location.href.indexOf('login.html') === -1 && location.href.indexOf('registration.html') === -1) {
				window.location.href = 'login.html?not_logged_in';
			}
		}
	});
}
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
/*
** Function purpose: Display list of all users
** members.html
*/
function getAllUsers() {
	dbResult('/Users/', function(key, value) {
		var uid = key;
		if ($('#allmembers-table tbody tr.' + uid).length === 0) {
			$('#allmembers-table tbody').append(
				'<tr class="' + uid + '"><td class="userName" id="userName' + uid + '"></td>'
			   +'<td class="userEmail" id="userEmail' + uid + '""></td>'
			   +'<td class="userGender" id="userGender' + uid + '""></td></tr>');
		}

		$.each(value, function(userAttr, val) {
			if (userAttr === 'Name') {
				$('#userName' + uid).html('<a href="members_profile.html?uid=' + uid + '">' + val + '</a>');
			} else if (userAttr === 'Email') {
				$('#userEmail' + uid).text(val);
			} else if (userAttr === 'Gender') {
				$('#userGender' + uid).text(val);
			}
		});
	}, function() {
		// Callback to retrieving DB data
	});
}
/*
** Function purpose: Display list of all ratings for current user
** profile.html
*/
function getUserRatings(){
    dbResult('/Ratings/', function(key,value) {
        var pid = key;
        getProfileID().then(function(idValue){
            if(pid == idValue) {
                $.each(value, function(userAttr, val){
                    $('#userRatings-table tbody').append('<tr class ="' + userAttr +
                        '"><td class="userProfileID" id="userProfileID' + userAttr +
                        '"><td class="userRating" id = "userRating' + userAttr +
                        '">');
                    $('#userProfileID' + userAttr).text(userAttr);
                    $('#userRating' + userAttr).text(val);
                });
            } /*else if ($('#userRatings-table tbody tr.' + pid).length === 0) {
                $('#userRatings-table tbody').append('<tr><td colspan="2">No data available in table</td></tr>');
            }*/
        }, function(){
            // if you need an additional callback function it should be here I believe
        });
    });
}
/*
 ** Function purpose: Registration - register new user
 ** registration.html
 **
 ** Required input: name, email, password
 */
 
 // Helper function to: createNewUser
function writeUserData(email, name) {
	let uid = getUID();
	let ref = firebase.database().ref('Users/');
	ref.child(uid).set({
		'Email': email,
		'Gender': "undefined",
		'Name': name,
		'Overall': 0,
		'ProfileID': 0
	});
}

async function createNewUser(email, password, name) {
	let ref = firebase.database().ref('Users/');
	let val = await firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		// Handle errors here
		var errorCode = error.code;
		var errorMessage = error.message;
		alert(errorMessage);
	});
	writeUserData(email, name);
}
/*
 ** Function purpose: Login - authenticate existing user
 ** login.html
 **
 ** Required input: email, password
 */
function signInExistingUser(email, password) {
	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		// Handle errors here
		var errorCode = error.code;
		var errorMessage = error.message;
		alert(errorMessage);
	});
}
/*
 ** Function purpose: Logout - sign out existing user
 **
 ** Output: Redirect to login.html?logged_out
 */
function signOutUser() {
	firebase.auth().signOut().then(function() {
		// Sign-out successful.
		// Redirect to login or main page.
		// Performed in onAuthStateChanged (in initialCheck())
	}).catch(function(error) {
		// An error happened.
	});
}
/*
 ** Function purpose: Verification - send the user an email to verify their account
 **
 ** Output: Alert
 */
function sendEmailVerification() {
	firebase.auth().currentUser.sendEmailVerification().then(function() {
		// Email sent.
		alert('Verification email has been sent.');
	}).catch(function(error) {
		// An error happened.
	});
}
/*
 ** Function purpose: Reset password
 **
 ** Required input: email
 **
 ** Output: Alert
 */
function sendPasswordReset(emailAddress) { // not used
	firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
		// Email sent.
		alert('Password reset email has been sent.');
	}).catch(function(error) {
		// An error happened.
	});
}
/*
 ** Function purpose: User data - access information about the existing user
 ** i.e. email, name, uid (user ID), profile ID, overall score, profile picture
 */
function getEmail() {
	return firebase.auth().currentUser.email;
}

function getName() {
	var uid = getUID();
	var ref = firebase.database().ref('Users/' + uid);
	var name = ref.once("value")
		.then(function(snapshot) {
			var name = snapshot.child("Name").val();
			return name;
		});
	return name;
}

function getUID() {
	return firebase.auth().currentUser.uid; // .getToken() shows blank
}

function getProfileID() {
	var uid = getUID();
	var ref = firebase.database().ref('Users/' + uid);
	var pid = ref.once("value").then(function(snapshot) {
		return snapshot.child("ProfileID").val();
  	});
  	return pid;
}

// Helper functions to: calculateScore
function common (avg, min, max) {
    return (avg >= min) && (avg <= max);
}

function getOverallScore() {
    var uid = getUID();
    var ref = firebase.database().ref('Users/' + uid);
    var score = ref.once("value").then(function(snapshot) {
        return snapshot.child("Overall").val();
    });
    return score;
}

function calculateScore() {
	dbResult('/Ratings/', function(key,value) {
        var pid = key;
        var arr = [];
        var A = 0.8;
        var B = 0.9;
        var z = 1 - Math.pow(Math.E,-1);
        
        getProfileID().then(function(idValue){
	        if(pid == idValue) {
                $.each(value, function(userAttr, val){
                    arr.push(val);
                });

                const reducer = (accumulator, currentValue) => accumulator + currentValue;
        		var sum = arr.reduce(reducer);
        		var avg = sum / arr.length;

                if(common(avg, 4, 10)) {
                	var scoreA = (A * avg + 10 * (1-A) * z).toFixed(2);
                	$('p.p-overallScore').append(' ' + scoreA);
                } else if (common(avg, 0, 4)) {
                	var scoreB = (A * avg + 10 * (1-B) * z).toFixed(2);
					$('p.p-overallScore').append(' ' + scoreB);
				} else {
					$('p.p-overallScore').append(' ' + sum);
				}
            }
        }, function(){});
    });
}

function getPhotoUrl() {
	var uid = getUID();
	var db = firebase.database().ref('Users/' + uid);
	var storage = firebase.storage();
	var gsRef = storage.refFromURL('gs://t-extinguisher.appspot.com/no-avatar.png');
	var checkPhoto = db.once("value").then(function(snapshot) {
		return snapshot.child("Photo").exists();
	});

	if(checkPhoto == true) {
		db.once("value").then(function(snapshot) {
			var url = snapshot.child("Photo").val();
			var img = document.getElementById('p-picture');
				img.src = url;
		});
	} else {
		gsRef.getDownloadURL().then(function(url) {
		var img = document.getElementById('p-picture');
			img.src = url;
		}).catch(function(error) {
		// Handle any errors
		});
	}
}
/*
 ** Function purpose: User data - update information about the existing user
 ** i.e. name, profile picture
 */
function updatePhoto() { // under construction
	// Get current user
	var user = firebase.auth().currentUser;
	// Create a storage ref w/ user
	var storageRef = firebase.storage().ref(user + '/profilePicture/' + file.name);
	// Upload file
	var task = storageRef.put(file);
	/*// The Firebase Way
	user.updateProfile({
		displayName: "",
		photoURL: ""
	}).then(function() {
		// Update successful
	}).catch(function(error) {
		// An error happened
	})*/
}

function updateName(newName) { // not used
	var user = firebase.auth().currentUser;

	user.updateProfile({
		displayName: newName
	}).then(function() {
		// Update successful
		window.location.reload();
	}).catch(function() {
		// An error happened.
	});
}