const {appendFileSync} = require("fs");
const simpleGit = require("simple-git");

const letters = [0x7c667c603c000000, 0x3e66663e06060600, 0x3c6606663c000000, 0x7c66667c60606000, 0x3c067e663c000000, 0x0c0c3e0c0c6c3800, 0x3c607c66667c0000, 0x6666663e06060600, 0x3c18181800180000, 0x1c36363030003000, 0x66361e3666060600, 0x1818181818181800, 0xd6d6feeec6000000, 0x6666667e3e000000, 0x3c6666663c000000, 0x06063e66663e0000, 0xf0b03c36363c0000, 0x060666663e000000, 0x3e403c027c000000, 0x1818187e18180000, 0x7c66666666000000, 0x183c666600000000, 0x7cd6d6d6c6000000, 0x663c183c66000000, 0x3c607c6666000000, 0x3c0c18303c000000]

const DATA_FILE_PATH = "./data.txt";
const START_DATE_STRING = "2015-01-04";
const MIN_COMMITS_PER_DAY = 1;
const MAX_COMMITS_PER_DAY = 10;
const NUM_COMMITS = 20

const STRING = "afrin"

const options = {
    baseDir: process.cwd(), binary: "git", maxConcurrentProcesses: 6,
};

let git = simpleGit(options);

let run = async () => {
    await git.pull();
    await git.add("./*");
    await git.commit("Automated - Initial");
    console.log("Initial commit done");

    let date = new Date(START_DATE_STRING);
    let dateStr = date.toISOString();

    let binaryStringPixelMap = ""
    for (let char of STRING) {
        binaryStringPixelMap += getCharBinaryPixelMap(char)
    }

    let numberOfCommits = 0
    for (let i = 0; i < binaryStringPixelMap.length; i++) {
        if (binaryStringPixelMap[i] === '1') {
            for (let j = 0; j < NUM_COMMITS; j++) {
                console.log("Pass: ", j);
                await appendFileSync(DATA_FILE_PATH, "X");
                await git.add("./*");
                await git.commit("Automated - X", {"--date": dateStr});
            }
            numberOfCommits += NUM_COMMITS
        }

        let dateSkip = 1
        date.setDate(date.getDate() + dateSkip);
        dateStr = date.toISOString();
        console.log(dateStr);
    }

    console.log("num of commits -> " + numberOfCommits)

    //   await git.push();
};

let getCharBinaryPixelMap = (char) => {
    let letter = letters[char.charCodeAt(0) - "a".charCodeAt(0)]

    let letterToBinaryString = letter.toString(2)
    let binLength = letterToBinaryString.length
    letterToBinaryString = "0".repeat(64 - binLength) + letterToBinaryString

    let letterToBinaryString7x7 = ""
    for (let i = 56; i > 0; i--) {
        if (i % 8 !== 0) {
            letterToBinaryString7x7 += letterToBinaryString[i]
        }
    }

    return letterToBinaryString7x7
}

run()
    .then((res) => console.log("done", res))
    .catch((ex) => console.error(ex));
