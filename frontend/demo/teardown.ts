import { execFileSync } from 'node:child_process';
import { DEMO_DB_CONTAINER } from '../playwright.demo.config';

/** Stopping `docker run` doesn't always stop the container, so remove it explicitly. */
export default function teardown() {
  try {
    execFileSync('docker', ['rm', '-f', DEMO_DB_CONTAINER], { stdio: 'ignore' });
  } catch {
    // Already gone.
  }
}
