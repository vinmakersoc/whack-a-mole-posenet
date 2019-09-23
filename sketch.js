let video;
let poseNet;
let poses = [];

// game
let playing = false;
let score = 0;
let target = { x: 50, y: 50 };
let nose = { x: -1000, y: -1000 };
let minRadius = 10;
let targetRadius = 40;

let minLimit = 1000;
let timeLimit = 5000;
let lastTimestamp;

let bgCol;

function setup() {
	const canvas = createCanvas(640, 480);
	canvas.parent("p5-canvas");
	fill(255, 255, 255);
	rect(-1, -1, width + 2, height + 2);

	video = createCapture(VIDEO);
	video.size(width, height);
	poseNet = ml5.poseNet(video, () => {
		select("#play-btn").html("play");
	});
	poseNet.on("pose", results => {
		poses = results;
	});
	video.hide();
}

function initColor() {}

function draw() {
	translate(width, 0);
	scale(-1, 1);

	image(video, 0, 0, width, height);
	fill(255, 255, 255, 200);
	rect(-1, -1, width + 2, height + 2);

	if (playing) {
		drawNose();
		drawTarget();
		drawTiming();
		check();
	} else {
		fill(67, 174, 166, 200);
		rect(-1, -1, width + 2, height + 2);
	}
}

function check() {
	if (dist(target.x, target.y, nose.x, nose.y) < targetRadius * 0.5) {
		updateScore(score + 1);
		resetTarget();
		resetTiming();
	}
}

function resetTarget() {
	targetRadius = Math.max(minRadius, targetRadius * 0.95);

	target.x = map(Math.random(), 0, 1, 0.05 * width, 0.95 * width);
	target.y = map(Math.random(), 0, 1, 0.05 * height, 0.95 * height);
}

function drawTarget() {
	push();

	stroke(159, 112, 208);
	strokeWeight(4);
	noFill();
	translate(target.x, target.y);
	ellipse(0, 0, targetRadius, targetRadius);

	pop();
}

function drawTiming() {
	push();

	const timeElapsed = millis() - lastTimestamp;
	if (timeElapsed > timeLimit) {
		fail();
	}
	const ratio = 1 - timeElapsed / timeLimit;
	const h = height * ratio;
	if (ratio < 0.3) {
		fill(255, 10, 10);
	} else {
		fill(67, 174, 112);
	}
	noStroke();
	rect(0, height - h, 10, h);

	pop();
}

function resetTiming() {
	lastTimestamp = millis();
	timeLimit = Math.max(minLimit, timeLimit * 0.95);
}

const playBtn = document.getElementById("play-btn");
function fail() {
	timeLimit = 5000;
	targetRadius = 40;
	playing = false;
	playBtn.style.display = "block";
}

// interactive events

playBtn.addEventListener("click", () => {
	playBtn.style.display = "none";
	updateScore(0);
	playing = true;
	lastTimestamp = millis();
});

// utilities

function updateScore(s) {
	score = s;
	document.getElementById("score").innerHTML = `score: ${s}`;
}

function drawNose() {
	if (poses.length > 0) {
		nose = poses[0].pose.keypoints[0].position;
		fill(255, 154, 0);
		noStroke();
		ellipse(nose.x, nose.y, 15, 15);
	}
}

function drawKeypoints() {
	for (let i = 0; i < poses.length; i++) {
		let pose = poses[i].pose;
		for (let j = 0; j < pose.keypoints.length; j++) {
			let keypoint = pose.keypoints[j];
			if (keypoint.score > 0.2) {
				fill(255, 0, 0);
				noStroke();
				ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
			}
		}
	}
}

function drawSkeleton() {
	for (let i = 0; i < poses.length; i++) {
		let skeleton = poses[i].skeleton;
		for (let j = 0; j < skeleton.length; j++) {
			let partA = skeleton[j][0];
			let partB = skeleton[j][1];
			stroke(255, 0, 0);
			line(
				partA.position.x,
				partA.position.y,
				partB.position.x,
				partB.position.y
			);
		}
	}
}