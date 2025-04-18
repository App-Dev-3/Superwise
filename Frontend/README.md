## Tech stack
- **Nuxt** framwork for Vue   
- **Vitest** for testing
- **I8ln** for localisation 
- **Pinia** for state managment
- **DaisyUI** for css designs

## Installation and running

1. Clone the repository
2. Change into the frontend directory

```bash
cd FeMatchMaker
```

3. Install dependencies: 
```bash
npm install
```
4. Run the application
```bash
npm run dev
```

## Testing with PWA
The PWA module is not fully compataibile with hot module replacement due to caching and other "middle man" functionalities. As a result whenever testing with PWA run the following command to boot the applicaiton
```bash
npm run generate-preview
```


## Testing
To Run all the test in the application, run the command
```bash
npm run test
```

To run tests on an individual file for development run the command
```bash
npm run test <file-name>
```
For running specific test (faster for development) install the official **Vitest** extention which would allow running specific test. A play button would appear next to each **Test** in the UI.

>If a play button doesnt appear, open the vitest extention and click the "Refrest Test" button

blub test