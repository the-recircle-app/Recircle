/**
 * Test script for diagnosing OpenAI Vision API connectivity issues
 */

import { OpenAI } from "openai";
import { log } from "./server/vite";
import fs from "fs";
import path from "path";

// Use the same settings we're using in the application
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 40000, // 40 seconds timeout
  maxRetries: 3, // Increase retries for reliability
  dangerouslyAllowBrowser: true // Added to improve connectivity in Replit environment
});

console.log("Starting OpenAI Vision API connection test...");
console.log("OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);

// Test with a sample image to diagnose vision-specific issues
async function testVisionApi(imagePath: string) {
  console.log(`\nTesting Vision API with image: ${path.basename(imagePath)}`);
  
  try {
    // First verify the image file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image file not found: ${imagePath}`);
      return false;
    }
    
    // Read the image file
    console.log("Reading image file...");
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    console.log(`Image read successfully (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
    
    // Start the API call
    console.log("Sending request to OpenAI Vision API...");
    const startTime = Date.now();
    
    // Use a very simple prompt to reduce processing time
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system", 
          content: "You are a receipt analyzer. Keep your response short."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Is this an image of a receipt? Answer yes or no only."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 20,
      temperature: 0.1
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ Success! Response received in ${duration.toFixed(2)}s`);
    console.log(`Response: "${response.choices[0].message.content}"`);
    
    return {
      success: true,
      duration,
      response: response.choices[0].message.content
    };
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    if (error.response?.headers) {
      console.error("Response headers:", error.response.headers);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the tests
async function runTests() {
  try {
    console.log("=============================================");
    console.log("OPENAI VISION API DIAGNOSTIC TEST");
    console.log("=============================================");
    
    // Use a sample image from the assets folder if available, or a sample test image
    const testImagePath = "./attached_assets/IMG_0449.jpeg";
    
    console.log(`Testing with image: ${testImagePath}`);
    const visionResult = await testVisionApi(testImagePath);
    
    console.log("\n=============================================");
    console.log("TEST RESULTS SUMMARY");
    console.log("=============================================");
    console.log(`Vision API: ${visionResult.success ? "✅ CONNECTED" : "❌ FAILED"}`);
    if (visionResult.success) {
      console.log(`Response time: ${visionResult.duration.toFixed(2)}s`);
    }
    console.log("=============================================");
    
    if (visionResult.success) {
      console.log("\n✅ OpenAI Vision API is working correctly.");
      console.log("If receipt validation is still failing in the application, the issue may be related to:");
      console.log("1. The specific images being processed in the application");
      console.log("2. The complexity of the prompt compared to our simple test");
      console.log("3. Differences in network conditions during actual usage");
    } else {
      console.log("\n❌ OpenAI Vision API test failed.");
      console.log("Potential issues:");
      console.log("1. Network connectivity issues for large binary data transfers");
      console.log("2. Timeout settings too short for image processing");
      console.log("3. API restrictions or rate limits specifically for vision API");
    }
    
  } catch (error) {
    console.error("Error running tests:", error);
  }
}

// Execute the tests
runTests();