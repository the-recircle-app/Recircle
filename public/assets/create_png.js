import fs from 'fs';
import { createCanvas } from 'canvas';

// Create a canvas
const size = 600;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Draw background
ctx.fillStyle = '#333333';
ctx.fillRect(0, 0, size, size);

// Draw the C shape
ctx.strokeStyle = '#FFFFFF';
ctx.lineWidth = 60;
ctx.lineCap = 'round';
ctx.beginPath();
ctx.arc(size/2, size/2, size/3, 0.2 * Math.PI, 1.8 * Math.PI);
ctx.stroke();

// Draw triangle arrow
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.moveTo(size * 0.9, size * 0.5);
ctx.lineTo(size * 0.7, size * 0.65);
ctx.lineTo(size * 0.7, size * 0.35);
ctx.closePath();
ctx.fill();

// Save to PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./public/assets/recircle_logo.png', buffer);

console.log('PNG created at ./public/assets/recircle_logo.png');
