# gcloud-pubsub-maxMessage-bug
Repo demonstrating a bug in the google cloud pubsub lib

## Steps to reproduce:
1. Clone project
2. `npm install`
3. Open `test.ts` and populate `GOOGLE_PROJECT_ID` with a proper project ID which you have authenticated access to
4. Execute the test with `npm start`
5. Observe the output

### Observations:
**Expected**: 10 messages published, only 2 process concurrently.

**Actual**: 10 messages published, all 10 process concurrently.
