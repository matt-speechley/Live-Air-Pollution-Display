let serial; // variable for the serial object
let sensors = [0, 0, 0]; // array to hold data from arduino

//Cloud variables:
var noOfParticles_PM25 = 0;
var mass_PM25 = [];
var positionX_PM25 = [];
var positionY_PM25 = [];
var velocityX_PM25 = [];
var velocityY_PM25 = [];

var noOfParticles_PM10 = 0;
var mass_PM10 = [];
var positionX_PM10 = [];
var positionY_PM10 = [];
var velocityX_PM10 = [];
var velocityY_PM10 = [];

var noOfParticles_N02 = 0;
var mass_N02 = [];
var positionX_N02 = [];
var positionY_N02 = [];
var velocityX_N02 = [];
var velocityY_N02 = [];


// label variables
var lineAy = 0;
var lineAyMax = 0;
var lineAyMin = 0;
var lineAdir = 0;
var lineBy = 0;
var lineByMax = 0;
var lineByMin = 0;
var lineBdir = 0;
var lineCy = 0;
var lineCyMax = 0;
var lineCyMin = 0;
var lineCdir = 0;

// sensor limit flag
var pm25exceeded = 0;
var pm10exceeded = 0;

function setup() {
  background(0);
  createCanvas(windowWidth, windowHeight+100);
  noStroke();
  fill(64, 255, 255, 192);

  // serial constructor
  serial = new p5.SerialPort();
  // serial port to use
  serial.open("/dev/tty.usbmodem1413201");
  // what to do when we get serial data
  serial.on("data", gotData);
  // what to do when the serial port opens
  serial.on("open", gotOpen);

  // create labels
  lineAy = random((windowHeight/10),(3*windowHeight/10));
  lineAyMax = 3*windowHeight/10;
  lineAyMin = 1*windowHeight/10;
  lineAdir = 0;
  lineBy = random((4*windowHeight/10),(6*windowHeight/10));
  lineByMax = 6*windowHeight/10;
  lineByMin = 4*windowHeight/10;
  lineBdir = 1;
  lineCy = random((7*windowHeight/10),(9*windowHeight/10));
  lineCyMax = 9*windowHeight/10;
  lineCyMin = 7*windowHeight/10;
  lineCdir = 1;
}

function draw() {

  background(20);

  // text
  noStroke();
  fill(255);
  textAlign(CENTER);
  textSize(18);
  if (pm25exceeded == 0) {
    text("PM2.5 Particles\nper 0.1L air:\n" + int((sensors[0]/255)*3000), (windowWidth/5), (lineAy));
  }
  if (pm25exceeded == 1) {
    text("PM2.5 Particles\nper 0.1L air:\n" + "Sensor limits exceeded!", (windowWidth/5), (lineAy));
  }  
  if (pm10exceeded == 0){
    text("PM10 Particles\nper 0.1L air:\n" + int(((sensors[1])/255)*1000), (4*windowWidth/5), (lineBy));
  }
  if (pm10exceeded == 1){
    text("PM10 Particles\nper 0.1L air:\n" + "Sensor limits exceeded!", (4*windowWidth/5), (lineBy));
  }
  text("N0x: " + sensors[2] + "PPM", ((windowWidth)/5), (lineCy));
  textSize(32);
  text("Live Air Pollution Levels", ((windowWidth)/2), (windowHeight/25));
  
  //bubbles
  fill(255, 32, 110, 192);
  pm25();
  fill(65, 255, 234, 212);
  pm10();
  fill(251, 255, 18, 192);
  n02();
  
  //PM2.5 Labels
  stroke(100)
  drawlineAy();
  line(2*windowWidth/3, windowHeight/5, windowWidth/3, lineAy);
  drawlineBy();
  line(windowWidth/3, windowHeight/2, 2*windowWidth/3, lineBy);
  drawlineCy();
  line(2*windowWidth/3, 4*windowHeight/5, windowWidth/3, lineCy);
}

// checks if serial data is available and reads it
function gotData() {
  let currentString = serial.readStringUntil('\r\n'); // store the data in a variable
  trim(currentString); // get rid of whitespace
  if (currentString.length > 0 && currentString != 'hi'){
  sensors = split(currentString, ",");
  console.log(sensors);
  serial.write("A");
  }
}

function gotOpen() {
  serial.clear(); // clears the buffer of any outstanding data
  serial.write("A"); // send a byte to the Arduino
}

// function for generating the pm25 bubble cloud
function pm25() {
  noOfParticles_PM25 = int((sensors[0]/255)*300); //no of pm25 particles on screen (not true value - that would be *3000)
  pm25exceeded = 0;
  if(noOfParticles_PM25 <= 0){
    noOfParticles_PM25 = 3000;
    pm25exceeded = 1;
  }
  if ((int((sensors[0]/255)*3000)) >= 3000) {
    noOfParticles_PM25 = 600;
    pm25exceeded = 1;
  }
  
  // update number of bubbles
  cloudSize_PM25()

  //assign each bubble a velocity
	for (var particleA = 0; particleA < mass_PM25.length; particleA++) {
		var accelerationX_PM25 = 0, accelerationY_PM25 = 0;
		
		for (var particleB = 0; particleB < mass_PM25.length; particleB++) {
			if (particleA != particleB) {
				var distanceX_PM25 = positionX_PM25[particleB] - positionX_PM25[particleA];
				var distanceY_PM25 = positionY_PM25[particleB] - positionY_PM25[particleA];

				var distance_PM25 = sqrt(distanceX_PM25 * distanceX_PM25 + distanceY_PM25 * distanceY_PM25);
				if (distance_PM25 < 1) distance_PM25 = 1;

				var force_PM25 = (distance_PM25 - 280) * mass_PM25[particleB] / distance_PM25; //size of large bubble
				accelerationX_PM25 += force_PM25 * distanceX_PM25;
				accelerationY_PM25 += force_PM25 * distanceY_PM25;
			}
		}

    velocityX_PM25[particleA] = velocityX_PM25[particleA] * 0.99 + accelerationX_PM25 * mass_PM25[particleA] + random(-0.06, 0.06);
		velocityY_PM25[particleA] = velocityY_PM25[particleA] * 0.99 + accelerationY_PM25 * mass_PM25[particleA] + random(-0.06, 0.06);
	}
	
  // update bubble position based on velocity
	for (var particle = 0; particle < mass_PM25.length; particle++) {
		positionX_PM25[particle] += velocityX_PM25[particle];
		positionY_PM25[particle] += velocityY_PM25[particle];
		// draw bubble
		ellipse(positionX_PM25[particle], positionY_PM25[particle], mass_PM25[particle] * 1000, mass_PM25[particle] * 1000);
	}
}

// add new bubble
function addNewParticle_PM25() {
  newParticleSize=random(0.003, 0.006)
  mass_PM25.push(0.001); //min max particle size
  for (;mass_PM25[mass_PM25.length-1] < newParticleSize; mass_PM25[mass_PM25.length-1] = mass_PM25[mass_PM25.length-1]*1.6)
  positionX_PM25.push(random((2*windowWidth/3)-(windowWidth/16), (2*windowWidth/3)+(windowWidth/16)));
  positionY_PM25.push(random((windowHeight/5)-(windowWidth/16), (windowHeight/5)+(windowWidth/16)));
  velocityX_PM25.push(0);
  velocityY_PM25.push(0);
}

// control bubble cloud size cloud based on sensor data
function cloudSize_PM25(){
  if (mass_PM25.length < noOfParticles_PM25){
    addNewParticle_PM25()
  }
  if (mass_PM25.length > noOfParticles_PM25) {
    mass_PM25[0] = mass_PM25[0]*0.5
    if (mass_PM25[0] < 0.003){
      mass_PM25.shift()
      positionX_PM25.shift()
      positionY_PM25.shift()
      velocityX_PM25.shift()
      velocityY_PM25.shift()
    }
  }
}

// function for controlling pm10 bubble
function pm10() {
  noOfParticles_PM10 = int((sensors[1]/255)*1000); //no of pm10 particles on screen
  pm10exceeded = 0;
  if (noOfParticles_PM10 >= 1000) {
    noOfParticles_PM10 = 300;
    pm10exceeded = 1;
  }

  // adjust number of bubbles depending on sensor reading
  cloudSize_PM10()

  // assign bubbles a velocity based on their mass and location relative to all other bubbles
	for (var particleA = 0; particleA < mass_PM10.length; particleA++) {
		var accelerationX_PM10 = 0, accelerationY_PM10 = 0;
		
		for (var particleB = 0; particleB < mass_PM10.length; particleB++) {
			if (particleA != particleB) {
				var distanceX_PM10 = positionX_PM10[particleB] - positionX_PM10[particleA];
				var distanceY_PM10 = positionY_PM10[particleB] - positionY_PM10[particleA];

				var distance_PM10 = sqrt(distanceX_PM10 * distanceX_PM10 + distanceY_PM10 * distanceY_PM10);
				if (distance_PM10 < 1) distance_PM10 = 1;

				var force_PM10 = (distance_PM10 - 280) * mass_PM10[particleB] / distance_PM10; //size of large bubble
				accelerationX_PM10 += force_PM10 * distanceX_PM10;
				accelerationY_PM10 += force_PM10 * distanceY_PM10;
			}
		}
		
		velocityX_PM10[particleA] = velocityX_PM10[particleA] * 0.99 + accelerationX_PM10 * mass_PM10[particleA] + random(-0.02, 0.02);
		velocityY_PM10[particleA] = velocityY_PM10[particleA] * 0.99 + accelerationY_PM10 * mass_PM10[particleA] + random(-0.02, 0.02);
	}
	
  // update bubble position based on velocity
	for (var particle = 0; particle < mass_PM10.length; particle++) {
		positionX_PM10[particle] += velocityX_PM10[particle];
		positionY_PM10[particle] += velocityY_PM10[particle];
		// draw bubble
		ellipse(positionX_PM10[particle], positionY_PM10[particle], mass_PM10[particle] * 1000, mass_PM10[particle] * 1000);
	}
}

// function for creating new bubbble
function addNewParticle_PM10() {
  newParticleSize=random(0.005, 0.01);  //min max particle size
  mass_PM10.push(0.001);
  for (;mass_PM10[mass_PM10.length-1] < newParticleSize; mass_PM10[mass_PM10.length-1] = mass_PM10[mass_PM10.length-1]*1.6)
  positionX_PM10.push(random((windowWidth/3)-(windowWidth/16), (windowWidth/3)+(windowWidth/16)));
  positionY_PM10.push(random((windowHeight/2)-(windowWidth/16), (windowHeight/2)+(windowWidth/16)));
  velocityX_PM10.push(0);
  velocityY_PM10.push(0);
}

// control size of bubble cloud
function cloudSize_PM10(){
  if (mass_PM10.length < noOfParticles_PM10){
    addNewParticle_PM10()
  }
  if (mass_PM10.length > noOfParticles_PM10) {
    mass_PM10[0] = mass_PM10[0]*0.5
    if (mass_PM10[0] < 0.003){
      mass_PM10.shift()
      positionX_PM10.shift()
      positionY_PM10.shift()
      velocityX_PM10.shift()
      velocityY_PM10.shift()
    }
  }
}

// function for controlling n02 cloud
function n02() {
  noOfParticles_N02 = sensors[2];
  cloudSize_N02()
	for (var particleA = 0; particleA < mass_N02.length; particleA++) {
		var accelerationX_N02 = 0, accelerationY_N02 = 0;
		
		for (var particleB = 0; particleB < mass_N02.length; particleB++) {
			if (particleA != particleB) {
				var distanceX_N02 = positionX_N02[particleB] - positionX_N02[particleA];
				var distanceY_N02 = positionY_N02[particleB] - positionY_N02[particleA];

				var distance_N02 = sqrt(distanceX_N02 * distanceX_N02 + distanceY_N02 * distanceY_N02);
				if (distance_N02 < 1) distance_N02 = 1;

				var force_N02 = (distance_N02 - 280) * mass_N02[particleB] / distance_N02; //size of large bubble
				accelerationX_N02 += force_N02 * distanceX_N02;
				accelerationY_N02 += force_N02 * distanceY_N02;
			}
		}
		
		velocityX_N02[particleA] = velocityX_N02[particleA] * 0.99 + accelerationX_N02 * mass_N02[particleA] + random(-0.1, 0.1);
		velocityY_N02[particleA] = velocityY_N02[particleA] * 0.99 + accelerationY_N02 * mass_N02[particleA] + random(-0.1, 0.1);
	}
	
	for (var particle = 0; particle < mass_N02.length; particle++) {
		positionX_N02[particle] += velocityX_N02[particle];
		positionY_N02[particle] += velocityY_N02[particle];
		
		ellipse(positionX_N02[particle], positionY_N02[particle], mass_N02[particle] * 1000, mass_N02[particle] * 1000);
	}
}

// add new n02 bubble
function addNewParticle_N02() {
  newParticleSize=random(0.001, 0.005) //min max particle size
  mass_N02.push(0.001); 
  for (;mass_N02[mass_N02.length-1] < newParticleSize; mass_N02[mass_N02.length-1] = mass_N02[mass_N02.length-1]*1.6)
positionX_N02.push(random(((2*windowWidth)/3)-(windowWidth/16), ((2*windowWidth)/3)+(windowWidth/16)));
positionY_N02.push(random((4*windowHeight/5)-(windowWidth/16), (4*windowHeight/5)+(windowWidth/16)));
velocityX_N02.push(0);
velocityY_N02.push(0);
}

// control number of n02 bubbbles based on sensor data
function cloudSize_N02(){
  //print(mass.length)
  if (mass_N02.length < noOfParticles_N02){
    addNewParticle_N02()
  }
  if (mass_N02.length > noOfParticles_N02) {
    mass_N02[0] = mass_N02[0]*0.5
    if (mass_N02[0] < 0.003){
      mass_N02.shift()
      positionX_N02.shift()
      positionY_N02.shift()
      velocityX_N02.shift()
      velocityY_N02.shift()
    }
  }
}

//functions for moving labels

function drawlineAy() {
  if (lineAdir == 0) {
    if (lineAy >= lineAyMax){
      lineAdir = 1
    } 
    lineAy = lineAy + 0.4
  }
  if (lineAdir == 1) { //move up
    if (lineAy <= lineAyMin){
      lineAdir = 0
    } 
    lineAy = lineAy - 0.4
  }  
}

function drawlineBy() {
  if (lineBdir == 0) {
    if (lineBy >= lineByMax){
      lineBdir = 1
    } 
    lineBy = lineBy + 0.4
  }
  if (lineBdir == 1) { //move up
    if (lineBy <= lineByMin){
      lineBdir = 0
    } 
    lineBy = lineBy - 0.4
  }  
}

function drawlineCy() {
  if (lineCdir == 0) {
    if (lineCy >= lineCyMax){
      lineCdir = 1
    } 
    lineCy = lineCy + 0.4
  }
  if (lineCdir == 1) { //move up
    if (lineCy <= lineCyMin){
      lineCdir = 0
    } 
    lineCy = lineCy - 0.4
  }  
}