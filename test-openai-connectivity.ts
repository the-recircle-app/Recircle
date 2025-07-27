/**
 * Test script for diagnosing OpenAI connectivity issues
 */

import { OpenAI } from "openai";
import { log } from "./server/vite";

// Use the same settings we're using in the application
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 40000, // 40 seconds timeout
  maxRetries: 3, // Increase retries for reliability
  dangerouslyAllowBrowser: true // Added to improve connectivity in Replit environment
});

console.log("Starting OpenAI connection test with TypeScript...");
console.log("OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);

// Test with a simple text-only request to isolate image-related issues
async function testTextOnlyRequest() {
  console.log("\n1. Testing basic text completion with gpt-3.5-turbo...");
  const startTime = Date.now();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Reply with a simple 'Connection test successful' if you receive this message."
        }
      ],
      max_tokens: 20,
      temperature: 0
    });
    
    const endTime = Date.now();
    console.log(`✅ Success! Response received in ${(endTime - startTime)/1000}s`);
    console.log(`Response: "${response.choices[0].message.content}"`);
    return true;
  } catch (error: any) {
    const endTime = Date.now();
    console.error(`❌ Error after ${(endTime - startTime)/1000}s:`, error.message);
    console.error("Error details:", error);
    return false;
  }
}

// Test with the model we're actually using for receipts
async function testGpt4TurboRequest() {
  console.log("\n2. Testing gpt-4-turbo text completion...");
  const startTime = Date.now();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Reply with a simple 'GPT-4-Turbo connection test successful' if you receive this message."
        }
      ],
      max_tokens: 20,
      temperature: 0
    });
    
    const endTime = Date.now();
    console.log(`✅ Success! Response received in ${(endTime - startTime)/1000}s`);
    console.log(`Response: "${response.choices[0].message.content}"`);
    return true;
  } catch (error: any) {
    const endTime = Date.now();
    console.error(`❌ Error after ${(endTime - startTime)/1000}s:`, error.message);
    console.error("Error details:", error);
    return false;
  }
}

// Run the tests
async function runTests() {
  try {
    console.log("=============================================");
    console.log("OPENAI CONNECTION DIAGNOSTIC TEST");
    console.log("=============================================");
    
    // First test with GPT-3.5-Turbo
    const test1Success = await testTextOnlyRequest();
    
    // Then test with GPT-4-Turbo
    const test2Success = await testGpt4TurboRequest();
    
    console.log("\n=============================================");
    console.log("TEST RESULTS SUMMARY");
    console.log("=============================================");
    console.log("GPT-3.5-Turbo: " + (test1Success ? "✅ CONNECTED" : "❌ FAILED"));
    console.log("GPT-4-Turbo: " + (test2Success ? "✅ CONNECTED" : "❌ FAILED"));
    console.log("=============================================");
    
    // Provide diagnostic information based on the test results
    if (test1Success && test2Success) {
      console.log("\n✅ All OpenAI API connections are working properly.");
      console.log("If image analysis is still failing, the issue may be related to:");
      console.log("1. The complexity or size of the image being processed");
      console.log("2. Network restrictions specifically for binary data (images)");
      console.log("3. Timeout settings in the client application");
    } else if (test1Success && !test2Success) {
      console.log("\n⚠️ GPT-3.5-Turbo works but GPT-4-Turbo fails.");
      console.log("This may indicate:");
      console.log("1. Your API key may not have access to GPT-4-Turbo");
      console.log("2. GPT-4-Turbo could be experiencing high load or timeouts");
      console.log("Consider switching to GPT-3.5-Turbo for image analysis or check your API key permissions");
    } else if (!test1Success && !test2Success) {
      console.log("\n❌ No OpenAI API connections are working.");
      console.log("This indicates:");
      console.log("1. API key may be invalid or expired");
      console.log("2. Network connectivity issues from the Replit environment to OpenAI");
      console.log("3. OpenAI API may be down or your account may have usage limits/restrictions");
      console.log("\nTry running this test from a different environment to isolate the issue");
    }
    
  } catch (error) {
    console.error("Error running tests:", error);
  }
}

// Execute the tests
runTests();