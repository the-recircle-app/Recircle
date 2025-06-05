import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToPng() {
  try {
    const svgPath = path.join(__dirname, '../public/recircle-earth-logo.svg');
    const pngPath = path.join(__dirname, '../public/recircle-earth-logo.png');

    // Read SVG content
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Create a canvas
    const width = 512;
    const height = 512;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw a green circular background
    ctx.fillStyle = '#1A7D40';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw concentric circles to represent earth
    ctx.fillStyle = '#3AAB58';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 210, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4DC970';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 190, 0, Math.PI * 2);
    ctx.fill();

    // Draw recycling arrows
    const drawArrow = (rotation) => {
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(rotation);
      ctx.scale(0.82, 0.82);
      
      // Draw arrow path
      ctx.beginPath();
      ctx.moveTo(0, -170);
      ctx.bezierCurveTo(70, -160, 140, -120, 170, -50);
      ctx.lineTo(140, -70);
      ctx.bezierCurveTo(150, -40, 160, -10, 170, 20);
      ctx.lineTo(100, -60);
      ctx.lineTo(140, -70);
      ctx.bezierCurveTo(120, -110, 70, -150, 0, -160);
      ctx.closePath();
      
      ctx.fill();
      ctx.restore();
    };

    // Draw the three arrows with different colors and rotations
    ctx.fillStyle = '#096A2E';
    drawArrow(0);
    
    ctx.fillStyle = '#32B158';
    drawArrow(2 * Math.PI / 3); // 120 degrees
    
    ctx.fillStyle = '#269B47';
    drawArrow(4 * Math.PI / 3); // 240 degrees

    // Draw white stroke around the arrows
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(i * 2 * Math.PI / 3);
      ctx.scale(0.82, 0.82);
      
      ctx.beginPath();
      ctx.moveTo(0, -170);
      ctx.bezierCurveTo(70, -160, 140, -120, 170, -50);
      ctx.lineTo(140, -70);
      ctx.bezierCurveTo(150, -40, 160, -10, 170, 20);
      ctx.lineTo(100, -60);
      ctx.lineTo(140, -70);
      ctx.bezierCurveTo(120, -110, 70, -150, 0, -160);
      ctx.closePath();
      
      ctx.stroke();
      ctx.restore();
    }

    // Draw central circle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 55, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#0E5E2D';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 45, 0, Math.PI * 2);
    ctx.fill();

    // Add B3TR text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 38px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B3TR', width / 2, height / 2);

    // Write to PNG file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, buffer);
    
    console.log(`PNG image has been saved to ${pngPath}`);
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

convertSvgToPng();