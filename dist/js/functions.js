$('#forgotpw').click(function(e) {
	e.preventDefault();
	sendPasswordReset(firebase.auth().currentUser.email);
});
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
  firebase.auth().ref('users/' + getUID()).set({
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