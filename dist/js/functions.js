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
				// Get Name of current user from database
				getName().then(function(value){
					$('p.p-name').append(' ' + value);
				});
				// Get Email of current user from database
				$('p.p-email').append(' ' + getEmail());
				// Get Profile ID of current user from database 
				getProfileID().then(function(value){
					$('p.p-profileid').append(' ' + value);
				});
				// Get user id from database
				$('p.p-uid').append(' ' + getUID());
			}

			if (!user.emailVerified) {
				sendEmailVerification();
			}

			/*if (user.displayName === null) {
				updateName(prompt('What is your name?'));
			}*/

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
		after();
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
				$('#userName' + uid).html('<a href="members_profile.html?uid=">' + val + '</a>');
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

function getUserRatings() {
	var n = 
	dbResult('/Ratings/', function(key, value) {
		var pid = key;
		if ($('#userRatings-table tbody tr.' + pid).length === 0) {
			$('#userRatings-table tbody').append(
				'<tr class="' + pid + '"><td class="userProfileID" id="userProfileID' + pid + '"></td>'
			   +'<td class="userRating" id="userRating' + pid + '""></td></tr>');
		}
		$.each(value, function(userAttr, val) {
			$('#userProfileID' + pid).text(userAttr);
			$('#userRating' + pid).text(val);
			}
			/*
			$.each(value, function(userAttr, val) {
			$('#userProfileID' + uid).text(userAttr);
			console.log(userAttr);
			$('#userRating' + uid).text(val);*/
		);
	}, function() {
		// Callback to retrieving DB data
	});
}

var rsc = new Firebase('https://t-extinguisher.firebaseio.com/');

var ratingsRsc = rsc.child("Ratings");

var ratingsKey = ratingsRsc.key();
console.log(ratingsKey);

/*
 ** Function purpose: Registration - register new user
 ** registration.html
 **
 ** Required input: Name, email, password
 */
function createNewUser(email, password, name) {
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		// Handle errors here
		var errorCode = error.code;
		var errorMessage = error.message;
		alert(errorMessage);
	});
	writeUserData();
}
// Helper function to: createNewUser
function writeUserData() {
	var userID = getUID();
  	firebase.auth().ref('Users/' + userID).set({
    	name: firebase.auth().currentUser.displayName,
    	email: firebase.auth().currentUser.email
  });
}
/*
 ** Function purpose: Login - authenticate existing user
 ** login.html
 **
 ** Required input: Email, password
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
 ** Required input: Email
 **
 ** Output: Alert
 */
function sendPasswordReset(emailAddress) {
	firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
		// Email sent.
		alert('Password reset email has been sent.');
	}).catch(function(error) {
		// An error happened.
	});
}
/*
 ** Function purpose: User data - access information about the existing user
 ** i.e. email, name, uid (user ID)
 */
function getEmail() {
	return firebase.auth().currentUser.email; //working
}

function getName() {
	var uid = getUID();
	var ref = firebase.database().ref('Users/' + uid);
	//return firebase.auth().currentUser.displayName; //currently returns null, but changes when line 45 works
	//var result = ref.once("value").then(function(snapshot) {
	//	return snapshot.child("Name").val();
	//});
	//var name = "Anonymous";
	var name = ref.once("value")
		.then(function(snapshot) {
			var name = snapshot.child("Name").val();
			return name;
		});
	return name;
}

function getUID() {
	return firebase.auth().currentUser.uid; //.getToken() shows blank
}

function getProfileID() {
	/*var userID = firebase.auth().currentUser.uid;
	return firebase.database().ref('/Users/' + userID + '/ProfileID').once('value').then(function(snapshot) {
		snapshot.val().ProfileID;
	});*/
	
	var uid = getUID();
	var ref = firebase.database().ref('Users/' + uid);
	var result = ref.once("value").then(function(snapshot) {
		return snapshot.child("ProfileID").val();
  	});
  	return result;
  	/*
  	var uid = getUID();
  	var ref = firebase.database().ref('Users/' + uid);
  	let myPromise = new Promise((resolve,reject) => {
  		setTimeout(function(){
  			resolve("Success!");
  		}, 250);
  	});
  	ref.once("value").myPromise.then(function(snapshot) => {
  		return new Promise((resolve, reject) => {
  			if(snapshot) {
  				snapshot.child("ProfileID").val();
  				resolve(snapshot);
  			} else {
  				reject(error);
  			}
  		});
  	});*/
}

function getPhotoUrl() {
	return firebase.auth().currentUser.photoURL;
}

function updatePhoto() {
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

function updateName(newName) {
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
