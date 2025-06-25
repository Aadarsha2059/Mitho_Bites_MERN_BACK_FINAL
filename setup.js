const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Setting up MithoBites Backend...\n');

// Function to run a script
function runScript(scriptPath, description) {
  return new Promise((resolve, reject) => {
    console.log(`📝 ${description}...`);
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error running ${scriptPath}:`, error);
        reject(error);
        return;
      }
      console.log(stdout);
      console.log(`✅ ${description} completed successfully!\n`);
      resolve();
    });
  });
}

// Main setup function
async function setup() {
  try {
    // Run sample data scripts
    await runScript(
      path.join(__dirname, 'scripts', 'createSampleCategories.js'),
      'Creating sample categories'
    );
    
    await runScript(
      path.join(__dirname, 'scripts', 'createSampleRestaurants.js'),
      'Creating sample restaurants'
    );
    
    await runScript(
      path.join(__dirname, 'scripts', 'createSampleProducts.js'),
      'Creating sample food products'
    );
    
    console.log('🎉 Setup completed successfully!');
    console.log('📡 Starting server on port 5050...\n');
    
    // Start the server
    exec('node server.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error starting server:', error);
        return;
      }
      console.log(stdout);
    });
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setup(); 