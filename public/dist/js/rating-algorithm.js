var A = 0.8;
var B = 0.9;
var p = [array from db];
var sum = p.reduce(add,0);
var avg = sum / p.length;
var z = 1 - Math.pow(Math.E,-1);

function add (a,b) {
	return a+b;
}

document.write("Total sum of ratings is " + sum);
document.write("P is " + avg);

function common (avg, min, max) {
	return (avg >= min) && (avg <= max);
}

if(common(avg, 4, 10)) {
	document.write("Rating = " + (A * avg + 10 * (1-A) * z).toFixed(2));
} else if (common(avg, 0, 4)) {
	document.write("Rating = " + (A * avg + 10 * (1-B) * z).toFixed(2));
} else {
	document.write("Error");
}