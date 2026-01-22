import { execSync } from 'child_process';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const checkGitStatus = () => {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    return status.trim().length > 0;
  } catch (error) {
    console.error('Error checking git status:', error.message);
    return false;
  }
};

const askForCommitMessage = () => {
  rl.question('Enter commit message: ', (commitMessage) => {
    const message = commitMessage.trim();

    if (!message) {
      console.log('\nCommit message cannot be empty. Please try again.');
      askForCommitMessage();
      return;
    }

    if (!checkGitStatus()) {
      console.log('\nNo changes to commit.');
      rl.close();
      return;
    }

    try {
      console.log('\nAdding files...');
      execSync('git add .', { stdio: 'inherit' });

      console.log('Committing changes...');
      // Escape double quotes to prevent command injection
      const escapedMessage = message.replace(/"/g, '\\"');
      execSync(`git commit -m "${escapedMessage}"`, { stdio: 'inherit' });

      console.log('Pushing to remote...');
      execSync('git push', { stdio: 'inherit' });

      console.log('\nSuccess! All changes have been pushed.');
    } catch (error) {
      console.error('\nGit operation failed:', error.message);
    } finally {
      rl.close();
    }
  });
};

askForCommitMessage();
