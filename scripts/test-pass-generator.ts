/**
 * Test script to generate a sample event pass
 * Run with: npx ts-node scripts/test-pass-generator.ts
 */

import { generateEventPass } from '../src/lib/pass-generator';
import fs from 'fs';
import path from 'path';

async function testPassGeneration() {
  console.log('🎟️  Generating test event pass...\n');

  const testData = {
    teamId: 'GT-2026-4496',
    teamName: 'RoboWarriors',
    eventName: 'Robo Race',
    collegeName: 'SRM College of Engineering',
  };

  console.log('Test Data:');
  console.log('  Team ID:', testData.teamId);
  console.log('  Team Name:', testData.teamName);
  console.log('  Event Name:', testData.eventName);
  console.log('  College Name:', testData.collegeName);
  console.log('');

  try {
    const passBuffer = await generateEventPass(testData);
    
    // Save to public/images for easy viewing
    const outputPath = path.join(process.cwd(), 'public', 'images', 'test-pass-output.png');
    fs.writeFileSync(outputPath, passBuffer);
    
    console.log('✅ Pass generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log('\nOpen this file to verify text positions are correct.');
  } catch (error) {
    console.error('❌ Error generating pass:', error);
  }
}

testPassGeneration();
