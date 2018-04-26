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
				//$('h1.page-header').append(' ' + getName() + '!');
				$('p.p-name').append(' ' + getName());
				$('p.p-email').append(' ' + getEmail());
				$('p.p-profileid').append(' ' + getProfileID());
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
			$('#allmembers-table tbody').append('<tr class="' + uid + '"><td class="userName"></td><td class="userEmail"></td><td class="userGender"></td></tr>');
		}

		$.each(value, function(userAttr, val) {
			if (userAttr === 'Name') {
				$('#allcourses-table tbody tr.' + uid + ' td.userName').html('<a href="members.html?uid=' + uid + '">' + val + '</a>');
			} else if (userAttr === 'Email') {
				$('#allcourses-table tbody tr.' + uid + ' td.userEmail').text(val);
			} else if (userAttr === 'Gender') {
				$('#allcourses-table tbody tr.' + uid + ' td.userGender').text(val);
			}
		});
	}, function() {
		// Callback to retrieving DB data
	});
}
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
	var result = ref.once("value").then(function(snapshot) {
		return snapshot.child("Name").val();
	});
	return result;
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