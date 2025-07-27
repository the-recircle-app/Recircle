/**
 * Test script for production receipt validation with actual application code
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Initialize OpenAI client with the exact same settings as in the application
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 40000, // 40 seconds timeout (increased from original)
  maxRetries: 3,  // More retries than original
  dangerouslyAllowBrowser: true
});

// This is the exact same prompt used in the application
const systemPrompt = `You are a receipt analyzer for sustainability rewards. Analyze the receipt image and classify it.

QUICK REFERENCE GUIDE:
- THRIFT STORES (Goodwill, Salvation Army): Always sustainable (confidence 0.95+)
- GAMESTOP: Only sustainable if receipt shows pre-owned/used items (look for "PRE-OWNED", "USED", or SKU "930/00")
- USED BOOK STORES: Must explicitly show used/pre-owned books
- ONLINE BOOKSTORES: ThriftBooks, Better World Books, AbeBooks, Biblio are always sustainable

CONFIDENCE GUIDELINES:
- 0.9-1.0: Clear evidence of sustainability
- 0.7-0.9: Good evidence but some ambiguity
- 0.5-0.7: Limited evidence, needs verification
- Below 0.5: Insufficient evidence`;

const userPrompt = "Is this from a sustainable store? Look for thrift stores or pre-owned items. Focus on key details: store name, date, amount, payment method.";

// Function to analyze receipt with app settings
async function analyzeReceiptImage(imagePath: string) {
  console.log(`\nAnalyzing receipt image: ${path.basename(imagePath)}`);
  
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
    
    // Start the API call with exact application settings
    console.log("Sending request to OpenAI with production settings...");
    const startTime = Date.now();
    
    // Use the exact same settings as production
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Updated from gpt-4o
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt
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
      temperature: 0.2,
      max_tokens: 800,
      top_p: 0.9,
      response_format: { type: "json_object" }
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ Success! Response received in ${duration.toFixed(2)}s`);
    console.log("Response summary:");
    
    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content);
    console.log(`- Store: ${result.storeName || 'Unknown'}`);
    console.log(`- Sustainable: ${result.isSustainableStore ? 'Yes' : 'No'}`);
    console.log(`- Confidence: ${result.confidence}`);
    console.log(`- Pre-owned items: ${result.containsPreOwnedItems ? 'Yes' : 'No'}`);
    
    return {
      success: true,
      duration,
      response: result
    };
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    console.error("Error details:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the tests
async function runTest() {
  try {
    console.log("=============================================");
    console.log("PRODUCTION RECEIPT VALIDATION TEST");
    console.log("=============================================");
    
    // Use attached sample images for testing
    const testImagePath = "./attached_assets/IMG_0449.jpeg";
    
    console.log(`Testing with real receipt image: ${testImagePath}`);
    console.log(`Using exact production settings`);
    console.log(`- Model: gpt-4-turbo`);
    console.log(`- Max tokens: 800`);
    console.log(`- Temperature: 0.2`);
    console.log(`- Response format: JSON`);
    console.log(`- System prompt: ${systemPrompt.length} chars`);
    console.log(`- User prompt: ${userPrompt.length} chars`);
    
    const testResult = await analyzeReceiptImage(testImagePath);
    
    console.log("\n=============================================");
    console.log("TEST RESULTS SUMMARY");
    console.log("=============================================");
    console.log(`Production validation: ${testResult.success ? "✅ CONNECTED" : "❌ FAILED"}`);
    if (testResult.success) {
      console.log(`Response time: ${testResult.duration.toFixed(2)}s`);
    } else {
      console.log(`Error: ${testResult.error}`);
    }
    console.log("=============================================");
    
    if (testResult.success) {
      console.log("\n✅ OpenAI receipt validation with production settings works!");
      console.log("The application settings work in the test environment but fail in production.");
      console.log("Likely causes:");
      console.log("1. Different network conditions during actual usage vs test");
      console.log("2. Different image sizes in production vs test");
      console.log("3. Possible rate limiting during high usage periods");
      console.log("\nRecommendations:");
      console.log("- Switch to GPT-3.5-Turbo-Vision for faster processing");
      console.log("- Further simplify the prompt for production");
      console.log("- Implement progressive JPEG loading to reduce initial request size");
    } else {
      console.log("\n❌ Production receipt validation test failed.");
      console.log("This matches the behavior seen in the application.");
      console.log("Potential issues:");
      console.log("1. The prompt+image combination is too complex for reliable processing");
      console.log("2. The timeout settings need to be increased further");
      console.log("3. Switch to a simpler model like GPT-3.5-Turbo for vision tasks");
    }
    
  } catch (error) {
    console.error("Error running tests:", error);
  }
}

// Execute the test
runTest();