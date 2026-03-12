import { runAuthTests } from './auth.test.js';
import { runContentValidationTests } from './contentValidation.test.js';

let failed = false;

function runTest(name, fn) {
    try {
        fn();
        process.stdout.write(`PASS ${name}\n`);
    } catch (error) {
        failed = true;
        process.stderr.write(`FAIL ${name}\n`);
        process.stderr.write(`${error.stack}\n`);
    }
}

runAuthTests(runTest);
runContentValidationTests(runTest);

if (failed) {
    process.exitCode = 1;
} else {
    process.stdout.write('All backend tests passed.\n');
}
