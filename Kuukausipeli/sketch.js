// Define the correct order of months
const correctMonths = ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"];

// Global variables
let gameMonths = [];
let placeholders = [];
let draggingMonth = null;
let gameState = "playing";
let submitButton = { x: 600, y: 600, w: 100, h: 30 };
let startTime; // Add timer variable
let floatOffset = 0; // Add this after other global variables
let sparkles = []; // Array to store sparkle particles
let confetti = []; // Add this with other global variables
let correctSound = null;
let finalTime = null; // Add variable for final time
let scores = [];
let playerName = "";
let inputField;
let newGameButton = { x: 600, y: 650, w: 120, h: 40 }; // Add new game button
let backgroundImg = null; // Add background image variable

function preload() {
  // Load background image
  try {
    backgroundImg = loadImage('assets/background.png', 
      // Success callback
      () => {
        console.log('Background image loaded successfully');
      },
      // Error callback
      (err) => {
        console.error('Error loading background image:', err);
        backgroundImg = null;
      }
    );
  } catch(e) {
    console.error('Background image loading error:', e);
    backgroundImg = null;
  }

  // Load sound effect with better error handling
  try {
    soundFormats('mp3', 'wav', 'ogg'); // Support multiple formats
    correctSound = loadSound(
      'assets/correct.mp3',
      // Success callback
      () => {
        console.log('Sound loaded successfully');
      },
      // Error callback
      (err) => {
        console.error('Error loading sound:', err);
        // Try alternative path
        try {
          correctSound = loadSound(
            './assets/correct.mp3',
            () => console.log('Sound loaded successfully from alternate path'),
            (err) => {
              console.error('Error loading sound from alternate path:', err);
              correctSound = null;
            }
          );
        } catch (e) {
          console.error('Error in alternate path loading:', e);
          correctSound = null;
        }
      },
      // Loading callback (optional)
      (progress) => {
        console.log('Loading progress:', progress);
      }
    );
  } catch(e) {
    console.error('Sound loading error:', e);
    correctSound = null;
  }
}

function setup() {
  // Create canvas and set drawing modes
  createCanvas(1200, 700);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(12);
  
  // Initialize audio context only after user interaction
  document.addEventListener('click', function() {
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
    }
  });
  
  // Load saved scores with error handling
  try {
    if (window.localStorage) {
      let savedScores = localStorage.getItem('monthGameScores');
      if (savedScores) {
        scores = JSON.parse(savedScores);
      }
    }
  } catch (e) {
    console.log('Error loading scores:', e);
    scores = []; // Use empty scores if there's an error
  }
  
  // Create input field for player name
  inputField = createInput('');
  inputField.position(width/2 - 100, height/2 - 50);
  inputField.size(200);
  inputField.hide();
  
  // Add window resize event listener
  window.addEventListener('resize', windowResized);
  
  // Initialize timer
  startTime = millis();
  
  // Initialize game months as objects
  gameMonths = correctMonths.map(name => ({
    name,
    placeholderIndex: -1,
    isDragging: false,
    pos: { x: 0, y: 0 }
  }));
  
  // Shuffle months for random starting positions
  gameMonths = shuffle(gameMonths);
  
  // Define 12 placeholders for months - centered on canvas
  const totalWidth = 12 * 85; // 80px box spacing + 5px margin
  const startX = (width - totalWidth) / 2 + 40; // Center the boxes
  
  for (let i = 0; i < 12; i++) {
    placeholders.push({ x: startX + i * 85, y: 350 });
  }
  
  // Set initial positions for months
  updateMonthPositions();
}

function draw() {
  // Clear the canvas first
  clear();
  
  // Draw background image if loaded
  if (backgroundImg) {
    // Scale the image to fit the canvas while maintaining aspect ratio
    let scale = Math.max(width / backgroundImg.width, height / backgroundImg.height);
    let newWidth = backgroundImg.width * scale;
    let newHeight = backgroundImg.height * scale;
    // Center the image
    let x = (width - newWidth) / 2;
    let y = (height - newHeight) / 2;
    image(backgroundImg, x, y, newWidth, newHeight);
  } else {
    // Fallback to white background if image not loaded
    background(255);
  }
  
  // Update float animation
  floatOffset = sin(frameCount * 0.05) * 10;
  
  // Draw timer with cute frame
  fill(255, 240, 245); // Light pink
  stroke(255, 182, 193);
  strokeWeight(3);
  rect(width - 100, 30, 180, 40, 15);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(20);
  
  // Use finalTime if game is complete, otherwise show current time
  let displayTime;
  if (gameState === "correct" && finalTime !== null) {
    displayTime = finalTime;
  } else {
    displayTime = Math.floor((millis() - startTime) / 1000);
  }
  
  let minutes = Math.floor(displayTime / 60);
  let seconds = displayTime % 60;
  text(`Aika: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, width - 100, 30);
  textAlign(CENTER, CENTER);
  textSize(12);
  strokeWeight(1);
  
  // Draw unicorn and princess characters with floating animation
  drawUnicorn(100, 200 + floatOffset, gameState === "correct");
  drawPrincess(1100, 200 + floatOffset, gameState === "correct");
  
  // Update and draw sparkles
  if (gameState === "correct") {
    if (random() < 0.2) {
      sparkles.push({
        x: random(width),
        y: random(height),
        life: 255
      });
    }
    updateSparkles();
  }
  
  // Draw placeholders
  for (let p of placeholders) {
    // Draw cute placeholder box with rounded corners
    stroke(255, 182, 193);
    strokeWeight(3);
    fill(255, 240, 245, 200); // Added some transparency
    rect(p.x, p.y, 80, 35, 10);
    
    // Add dotted pattern
    stroke(255, 182, 193, 100);
    strokeWeight(1);
    for(let i = 0; i < 3; i++) {
      for(let j = 0; j < 3; j++) {
        point(p.x - 20 + i * 20, p.y - 10 + j * 10);
      }
    }
  }
  
  // Draw months
  for (let m of gameMonths) {
    // Draw card background with shadow
    push();
    translate(m.pos.x, m.pos.y);
    
    // Shadow
    fill(0, 20);
    noStroke();
    rect(2, 2, 80, 35, 10);
    
    // Card
    stroke(135, 206, 235);
    strokeWeight(3);
    fill(255);
    rect(0, 0, 80, 35, 10);
    
    // Text with slight 3D effect
    fill(100, 149, 237);
    noStroke();
    text(m.name, 1, 1);
    fill(0);
    text(m.name, 0, 0);
    
    // Add small decorative elements based on season
    let monthIndex = correctMonths.indexOf(m.name);
    if (monthIndex >= 0) {
      push();
      translate(-30, 0);
      scale(0.3);
      if (monthIndex < 2 || monthIndex === 11) { // Winter
        drawSnowflake();
      } else if (monthIndex < 5) { // Spring
        drawFlower();
      } else if (monthIndex < 8) { // Summer
        drawSun();
      } else { // Fall
        drawLeaf();
      }
      pop();
    }
    
    pop();
  }
  
  // Draw submit button with animation
  push();
  let buttonY = submitButton.y + sin(frameCount * 0.05) * 5;
  stroke(34, 139, 34);
  strokeWeight(3);
  fill(144, 238, 144);
  rect(submitButton.x, buttonY, submitButton.w, submitButton.h, 15);
  fill(0);
  textSize(16);
  text("Tarkista!", submitButton.x, buttonY);
  
  // Add sparkles to button when all months are placed
  let placedMonths = gameMonths.filter(m => m.placeholderIndex >= 0).length;
  if (placedMonths === 12) {
    drawButtonSparkles(submitButton.x, buttonY);
  }
  pop();
  
  // Display feedback based on game state
  if (gameState === "correct") {
    // Update and draw confetti
    for(let i = confetti.length - 1; i >= 0; i--) {
      let c = confetti[i];
      c.y += c.speed;
      c.rotation += c.rotSpeed;
      
      push();
      translate(c.x, c.y);
      rotate(c.rotation);
      fill(c.color);
      noStroke();
      rect(0, 0, c.size, c.size);
      pop();
      
      // Remove confetti that's fallen off screen
      if (c.y > height + 20) {
        confetti.splice(i, 1);
      }
    }
    
    // Add new confetti occasionally
    if (random() < 0.1 && confetti.length < 100) {
      confetti.push({
        x: random(width),
        y: -20,
        size: random(5, 15),
        speed: random(2, 8),
        color: color(random(255), random(255), random(255)),
        rotation: random(TWO_PI),
        rotSpeed: random(-0.1, 0.1)
      });
    }
    
    fill(0, 255, 0);
    textSize(24);
    text("Oikein! Hienoa työtä!", width / 2, 50);
    
    // Show name input if not entered yet
    if (playerName === "") {
      // Draw background box with gradient
      fill(255, 240, 245);
      stroke(255, 182, 193);
      strokeWeight(3);
      rect(width/2, height/2, 400, 200, 15);
      
      // Draw title
      fill(0);
      textSize(24);
      text("Syötä nimesi tulostaulukkoon:", width/2, height/2 - 60);
      
      // Update input field position each frame to ensure it stays aligned
      updateInputFieldPosition();
      inputField.show();
      
      // Draw submit button for name
      fill(144, 238, 144);
      stroke(34, 139, 34);
      rect(width/2, height/2 + 50, 100, 30, 15);
      fill(0);
      textSize(20);
      text("OK", width/2, height/2 + 50);
    } else {
      // Show scoreboard
      drawScoreboard();
    }
    
    textSize(12);
  } else if (gameState === "incorrect") {
    fill(255, 0, 0);
    textSize(24);
    text("Yritä uudelleen! Sinä pystyt siihen!", width / 2, 50);
    textSize(12);
    inputField.hide();
  } else {
    inputField.hide();
  }
  
  // Draw new game button
  if (gameState === "correct") {
    drawNewGameButton();
  }
}

function drawUnicorn(x, y, isCorrect) {
  push();
  translate(x, y);
  stroke(0);
  
  // Rainbow tail
  let colors = [color(255,0,0), color(255,165,0), color(255,255,0), 
                color(0,255,0), color(0,0,255), color(238,130,238)];
  for(let i = 0; i < 6; i++) {
    stroke(colors[i]);
    strokeWeight(3);
    noFill();
    curve(-40+i*2, -10, -30+i*2, 0, -20+i*2, 10, -10+i*2, 0);
  }
  strokeWeight(1);
  
  // Body
  stroke(0);
  fill(255, 240, 245); // Light pink
  ellipse(0, 0, 80, 40);
  
  // Head
  ellipse(20, -20, 40, 30);
  
  // Legs with cute hooves
  stroke(0);
  line(-20, 20, -20, 45);
  line(20, 20, 20, 45);
  fill(200);
  ellipse(-20, 48, 10, 6);
  ellipse(20, 48, 10, 6);
  
  // Horn with sparkle
  if (isCorrect) {
    fill(255, 255, 0);
    stroke(255, 215, 0);
  } else {
    fill(255, 192, 203);
    stroke(255, 182, 193);
  }
  strokeWeight(2);
  beginShape();
  vertex(20, -35);
  vertex(25, -45);
  vertex(30, -35);
  vertex(25, -25);
  endShape(CLOSE);
  strokeWeight(1);
  
  // Eyes with sparkle
  fill(0);
  ellipse(15, -25, 6, 8);
  ellipse(25, -25, 6, 8);
  fill(255);
  ellipse(16, -26, 2, 2);
  ellipse(26, -26, 2, 2);
  
  // Mane with rainbow colors
  noFill();
  for(let i = 0; i < colors.length; i++) {
    stroke(colors[i]);
    bezier(20, -30+i, 30+i, -40-i, 40-i, -30+i, 50, -20-i);
  }
  
  // Cute blush
  if (isCorrect) {
    fill(255, 182, 193, 150);
    noStroke();
    ellipse(10, -15, 8, 4);
    ellipse(30, -15, 8, 4);
  }
  
  pop();
}

function drawPrincess(x, y, isCorrect) {
  push();
  translate(x, y);
  stroke(0);
  
  // Dress with gradient and sparkles
  for(let i = 0; i < 40; i++) {
    let inter = map(i, 0, 40, 0, 1);
    let c = lerpColor(color(255, 192, 203), color(255, 182, 193), inter);
    fill(c);
    noStroke();
    rect(0, i, 20-i/2, 1);
  }
  
  // Head
  fill(255, 224, 189);
  stroke(0);
  circle(0, -30, 30);
  
  // Hair with flowing effect
  fill(139, 69, 19);
  let hairOffset = sin(frameCount * 0.05) * 3;
  beginShape();
  vertex(-15, -30);
  bezierVertex(-20+hairOffset, -20, -25+hairOffset, 0, -15+hairOffset, 20);
  bezierVertex(-5+hairOffset, 0, 5+hairOffset, -20, 15, -30);
  endShape();
  
  // Crown with jewels
  fill(255, 215, 0);
  stroke(0);
  triangle(-10, -40, -5, -50, 0, -40);
  triangle(0, -40, 5, -50, 10, -40);
  fill(255, 0, 0);
  circle(-5, -45, 4);
  fill(0, 0, 255);
  circle(5, -45, 4);
  
  // Eyes with lashes
  fill(0);
  ellipse(-5, -30, 4, 6);
  ellipse(5, -30, 4, 6);
  stroke(0);
  // Eyelashes
  line(-7, -34, -9, -36);
  line(-5, -34, -5, -36);
  line(-3, -34, -1, -36);
  line(3, -34, 1, -36);
  line(5, -34, 5, -36);
  line(7, -34, 9, -36);
  
  // Smile
  if (isCorrect) {
    noFill();
    stroke(0);
    arc(0, -25, 12, 8, 0, PI);
    // Rosy cheeks
    fill(255, 182, 193, 150);
    noStroke();
    ellipse(-8, -25, 6, 4);
    ellipse(8, -25, 6, 4);
  } else {
    noFill();
    stroke(0);
    arc(0, -25, 8, 4, 0, PI);
  }
  
  pop();
}

function updateSparkles() {
  for (let i = sparkles.length - 1; i >= 0; i--) {
    let s = sparkles[i];
    s.y -= 2;
    s.life -= 5;
    
    fill(255, 255, 0, s.life);
    star(s.x, s.y, 5, 10, 5);
    
    if (s.life <= 0) {
      sparkles.splice(i, 1);
    }
  }
}

function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle/2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a+halfAngle) * radius1;
    sy = y + sin(a+halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function drawSnowflake() {
  stroke(200);
  strokeWeight(2);
  for(let i = 0; i < 6; i++) {
    push();
    rotate(i * PI/3);
    line(0, 0, 0, 15);
    line(0, 5, 5, 10);
    line(0, 5, -5, 10);
    pop();
  }
}

function drawFlower() {
  noStroke();
  fill(255, 192, 203);
  for(let i = 0; i < 6; i++) {
    push();
    rotate(i * PI/3);
    ellipse(0, 10, 8, 15);
    pop();
  }
  fill(255, 255, 0);
  circle(0, 0, 10);
}

function drawSun() {
  fill(255, 255, 0);
  circle(0, 0, 20);
  stroke(255, 200, 0);
  strokeWeight(2);
  for(let i = 0; i < 8; i++) {
    push();
    rotate(i * PI/4);
    line(0, 15, 0, 20);
    pop();
  }
}

function drawLeaf() {
  fill(139, 69, 19);
  noStroke();
  beginShape();
  vertex(0, 0);
  bezierVertex(10, -5, 20, -5, 20, 0);
  bezierVertex(20, 5, 10, 5, 0, 0);
  endShape();
  stroke(139, 69, 19);
  line(0, 0, -5, 5);
}

function drawButtonSparkles(x, y) {
  stroke(255, 255, 0);
  strokeWeight(2);
  for(let i = 0; i < 5; i++) {
    let angle = frameCount * 0.1 + i * TWO_PI/5;
    let sparkleX = x + cos(angle) * 60;
    let sparkleY = y + sin(angle) * 30;
    push();
    translate(sparkleX, sparkleY);
    rotate(frameCount * 0.1);
    line(-5, 0, 5, 0);
    line(0, -5, 0, 5);
    pop();
  }
}

function submitScore() {
  let name = inputField.value().trim();
  if (name !== "") {
    playerName = name;
    // Add new score
    let newScore = {
      name: playerName,
      time: finalTime,
      date: new Date().toLocaleDateString()
    };
    scores.push(newScore);
    // Sort scores by time
    scores.sort((a, b) => a.time - b.time);
    // Keep only top 10 scores
    if (scores.length > 10) {
      scores.length = 10;
    }
    // Save to localStorage with error handling
    try {
      if (window.localStorage) {
        localStorage.setItem('monthGameScores', JSON.stringify(scores));
      }
    } catch (e) {
      console.log('Error saving scores:', e);
    }
    inputField.hide();
  }
}

function drawScoreboard() {
  // Draw smaller scoreboard at the top
  let scoreboardWidth = 300;
  let scoreboardHeight = 200;
  let scoreboardX = width/2;
  let scoreboardY = 120;
  
  // Draw scoreboard background with gradient
  for(let i = 0; i < scoreboardHeight; i++) {
    let inter = map(i, 0, scoreboardHeight, 0, 1);
    let c = lerpColor(color(255, 240, 245), color(255, 228, 225), inter);
    stroke(c);
    line(scoreboardX - scoreboardWidth/2, scoreboardY - scoreboardHeight/2 + i,
         scoreboardX + scoreboardWidth/2, scoreboardY - scoreboardHeight/2 + i);
  }
  
  // Draw border with hearts
  stroke(255, 182, 193);
  strokeWeight(3);
  rect(scoreboardX, scoreboardY, scoreboardWidth, scoreboardHeight, 15);
  
  // Draw cute hearts in corners
  drawHeart(scoreboardX - scoreboardWidth/2 + 15, scoreboardY - scoreboardHeight/2 + 15, 10);
  drawHeart(scoreboardX + scoreboardWidth/2 - 15, scoreboardY - scoreboardHeight/2 + 15, 10);
  drawHeart(scoreboardX - scoreboardWidth/2 + 15, scoreboardY + scoreboardHeight/2 - 15, 10);
  drawHeart(scoreboardX + scoreboardWidth/2 - 15, scoreboardY + scoreboardHeight/2 - 15, 10);
  
  // Draw title
  fill(255, 105, 180);
  textSize(18);
  text("✨ Parhaat Tulokset ✨", scoreboardX, scoreboardY - scoreboardHeight/2 + 25);
  
  // Draw scores
  textSize(12);
  textAlign(LEFT, CENTER);
  let startY = scoreboardY - scoreboardHeight/2 + 50;
  
  // Draw headers
  fill(255, 105, 180);
  text("Sija", scoreboardX - 130, startY);
  text("Nimi", scoreboardX - 90, startY);
  text("Aika", scoreboardX + 20, startY);
  
  // Draw top 5 scores only
  fill(0);
  for (let i = 0; i < Math.min(5, scores.length); i++) {
    let y = startY + 25 * (i + 1);
    let score = scores[i];
    let minutes = Math.floor(score.time / 60);
    let seconds = score.time % 60;
    let timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Highlight current player's score
    if (score.name === playerName && score.time === finalTime) {
      fill(144, 238, 144);
      noStroke();
      rect(scoreboardX, y, scoreboardWidth - 20, 20);
      fill(0);
    }
    
    text(`${i + 1}.`, scoreboardX - 130, y);
    text(score.name, scoreboardX - 90, y);
    text(timeStr, scoreboardX + 20, y);
  }
  
  textAlign(CENTER, CENTER);
}

function drawHeart(x, y, size) {
  push();
  translate(x, y);
  fill(255, 105, 180);
  noStroke();
  beginShape();
  vertex(0, size/2);
  bezierVertex(-size/2, -size/2, -size, 0, 0, size);
  bezierVertex(size, 0, size/2, -size/2, 0, size/2);
  endShape();
  pop();
}

function resetGame() {
  gameState = "playing";
  startTime = millis();
  finalTime = null;
  playerName = "";
  inputField.hide();
  gameMonths = correctMonths.map(name => ({
    name,
    placeholderIndex: -1,
    isDragging: false,
    pos: { x: 0, y: 0 }
  }));
  gameMonths = shuffle(gameMonths);
  updateMonthPositions();
}

function mousePressed() {
  // Check for new game button click
  if (gameState === "correct" &&
      mouseX > newGameButton.x - newGameButton.w/2 &&
      mouseX < newGameButton.x + newGameButton.w/2 &&
      mouseY > newGameButton.y - newGameButton.h/2 &&
      mouseY < newGameButton.y + newGameButton.h/2) {
    resetGame();
    return;
  }
  
  if (gameState === "correct" && playerName === "") {
    // Check if OK button is clicked for name submission
    if (mouseX > width/2 - 50 && mouseX < width/2 + 50 &&
        mouseY > height/2 + 35 && mouseY < height/2 + 65) {
      submitScore();
    }
  }
  
  // Check if submit button is clicked
  if (mouseX > submitButton.x - submitButton.w/2 && mouseX < submitButton.x + submitButton.w/2 &&
      mouseY > submitButton.y - submitButton.h/2 && mouseY < submitButton.y + submitButton.h/2) {
    let allCorrect = true;
    
    // Check each position
    for (let i = 0; i < 12; i++) {
      let m = gameMonths.find(m => m.placeholderIndex === i);
      if (!m || m.name !== correctMonths[i]) {
        if (m) {
          m.placeholderIndex = -1;
        }
        allCorrect = false;
      }
    }
    
    let placedMonths = gameMonths.filter(m => m.placeholderIndex >= 0).length;
    allCorrect = allCorrect && (placedMonths === 12);
    
    // Update positions after removing incorrect months
    updateMonthPositions();
    
    // Update game state and play celebration if correct
    if (allCorrect && gameState !== "correct") {
      gameState = "correct";
      // Store the final time when correct
      finalTime = Math.floor((millis() - startTime) / 1000);
      // Play sound only if available
      if (correctSound) {
        try {
          correctSound.play();
        } catch(e) {
          console.log('Error playing sound:', e);
        }
      }
      // Create confetti
      for(let i = 0; i < 100; i++) {
        confetti.push({
          x: random(width),
          y: -20,
          size: random(5, 15),
          speed: random(2, 8),
          color: color(random(255), random(255), random(255)),
          rotation: random(TWO_PI),
          rotSpeed: random(-0.1, 0.1)
        });
      }
    } else if (!allCorrect) {
      gameState = "incorrect";
    }
  } else {
    // Check if a month is clicked to start dragging - adjusted for new size
    for (let m of gameMonths) {
      if (mouseX > m.pos.x - 40 && mouseX < m.pos.x + 40 && // Adjusted hit area
          mouseY > m.pos.y - 17 && mouseY < m.pos.y + 17) {
        draggingMonth = m;
        m.isDragging = true;
        break;
      }
    }
  }
}

function mouseDragged() {
  // Update position of the dragged month
  if (draggingMonth) {
    draggingMonth.pos.x = mouseX;
    draggingMonth.pos.y = mouseY;
  }
}

function mouseReleased() {
  // Handle dropping the dragged month
  if (draggingMonth) {
    let dropped = false;
    for (let i = 0; i < placeholders.length; i++) {
      let p = placeholders[i];
      if (dist(draggingMonth.pos.x, draggingMonth.pos.y, p.x, p.y) < 50) { // Increased detection radius
        // If placeholder is occupied, swap positions with existing month
        let existingMonth = gameMonths.find(m => m.placeholderIndex === i);
        if (existingMonth) {
          existingMonth.placeholderIndex = draggingMonth.placeholderIndex;
          // Immediately update the existing month's position
          if (existingMonth.placeholderIndex === -1) {
            existingMonth.pos.x = draggingMonth.pos.x;
            existingMonth.pos.y = draggingMonth.pos.y;
          }
        }
        // Immediately update the dragged month's position
        draggingMonth.pos.x = p.x;
        draggingMonth.pos.y = p.y;
        draggingMonth.placeholderIndex = i;
        dropped = true;
        break;
      }
    }
    // If not dropped in a placeholder, return to storage
    if (!dropped) {
      draggingMonth.placeholderIndex = -1;
    }
    updateMonthPositions();
    draggingMonth.isDragging = false;
    draggingMonth = null;
  }
}

function updateMonthPositions() {
  // Count how many months are in storage
  let storageCount = 0;
  
  // Position months in placeholders first
  gameMonths.forEach(m => {
    if (m.placeholderIndex >= 0 && !m.isDragging) {
      m.pos.x = placeholders[m.placeholderIndex].x;
      m.pos.y = placeholders[m.placeholderIndex].y;
    } else if (m.placeholderIndex === -1 && !m.isDragging) {
      storageCount++;
    }
  });
  
  // Then arrange months in storage area
  let storageIndex = 0;
  const storageStartX = (width - (storageCount * 85)) / 2 + 40; // Center storage area
  
  gameMonths.forEach(m => {
    if (m.placeholderIndex === -1 && !m.isDragging) {
      m.pos.x = storageStartX + storageIndex * 85;
      m.pos.y = 550;
      storageIndex++;
    }
  });
}

function drawNewGameButton() {
  push();
  // Button background with gradient
  let buttonY = newGameButton.y + sin(frameCount * 0.05) * 3;
  for(let i = 0; i < newGameButton.h; i++) {
    let inter = map(i, 0, newGameButton.h, 0, 1);
    let c = lerpColor(color(255, 192, 203), color(255, 182, 193), inter);
    stroke(c);
    line(newGameButton.x - newGameButton.w/2, buttonY - newGameButton.h/2 + i,
         newGameButton.x + newGameButton.w/2, buttonY - newGameButton.h/2 + i);
  }
  
  // Button border
  stroke(255, 105, 180);
  strokeWeight(3);
  noFill();
  rect(newGameButton.x, buttonY, newGameButton.w, newGameButton.h, 15);
  
  // Button text
  fill(0);
  noStroke();
  textSize(20);
  text("Uusi peli", newGameButton.x, buttonY);
  
  // Add sparkles
  drawButtonSparkles(newGameButton.x, buttonY);
  pop();
}

function windowResized() {
  // Resize canvas to fit window (optional, remove if you want fixed size)
  // resizeCanvas(windowWidth, windowHeight);
  
  // Update input field position if it's visible
  if (gameState === "correct" && playerName === "") {
    updateInputFieldPosition();
  }
}

function updateInputFieldPosition() {
  // Get the canvas position and scale
  let canvas = document.querySelector('canvas');
  let rect = canvas.getBoundingClientRect();
  
  // Calculate scale factors
  let scaleX = rect.width / width;
  let scaleY = rect.height / height;
  
  // Calculate the position in browser coordinates
  let inputX = rect.left + (width/2 - 100) * scaleX;
  let inputY = rect.top + (height/2 - 30) * scaleY; // Move up more to create better spacing
  
  // Update input field position
  inputField.position(inputX, inputY);
  inputField.size(200 * scaleX);
}