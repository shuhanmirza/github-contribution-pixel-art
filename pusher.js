const { appendFileSync } = require("fs");
const simpleGit = require("simple-git");
const math = require("mathjs");
const { transpose } = require("mathjs");

const letterHexList = [
  0x7c667c603c000000, 0x3e66663e06060600, 0x3c6606663c000000,
  0x7c66667c60606000, 0x3c067e663c000000, 0x0c0c3e0c0c6c3800,
  0x3c607c66667c0000, 0x6666663e06060600, 0x3c18181800180000,
  0x1c36363030003000, 0x66361e3666060600, 0x1818181818181800,
  0xd6d6feeec6000000, 0x6666667e3e000000, 0x3c6666663c000000,
  0x06063e66663e0000, 0xf0b03c36363c0000, 0x060666663e000000,
  0x3e403c027c000000, 0x1818187e18180000, 0x7c66666666000000,
  0x183c666600000000, 0x7cd6d6d6c6000000, 0x663c183c66000000,
  0x3c607c6666000000, 0x3c0c18303c000000,
];

const letterMatrices = {};

const DATA_FILE_PATH = "./data.txt";
const NUM_COMMITS = 20;

// -------------------
const START_DATE_STRING = "2023-02-14"; // from the point the art will start from. the upper left pixel of contribution graph
const STRING = "nodejs"; // Input what you want to print here
// -------------------

const options = {
  baseDir: process.cwd(),
  binary: "git",
  maxConcurrentProcesses: 6,
};

let git = simpleGit(options);

let run = async () => {
  build7x7matrices();

  await git.pull();
  await git.add("./*");
  await git.commit("Automated - Initial");
  console.log("Initial commit done");

  let date = new Date(START_DATE_STRING);
  let dateStr = date.toISOString();

  let binaryStringPixelMap = "";
  for (let char of STRING) {
    binaryStringPixelMap += getCharBinaryPixelMap(char);
  }

  let numberOfCommits = 0;
  for (let i = 0; i < binaryStringPixelMap.length; i++) {
    if (binaryStringPixelMap[i] === "1") {
      for (let j = 0; j < NUM_COMMITS; j++) {
        console.log("Pass: ", j);
        await appendFileSync(DATA_FILE_PATH, "X");
        await git.add("./*");
        await git.commit("Automated - X", { "--date": dateStr });
      }
      numberOfCommits += NUM_COMMITS;
    }

    let dateSkip = 1;
    date.setDate(date.getDate() + dateSkip);
    dateStr = date.toISOString();
    console.log(dateStr);
  }

  console.log("num of commits -> " + numberOfCommits);

  //   await git.push();
};

let build7x7matrices = () => {
  let letter = "a";
  for (let letterHex of letterHexList) {
    let letterBinaryString = letterHex.toString(2);
    let binaryLength = letterBinaryString.length;
    letterBinaryString = "0".repeat(64 - binaryLength) + letterBinaryString;
    let letter7x7BinaryString = get7x7BinaryString(letterBinaryString);

    letterMatrices[letter] = process7x7matrix(
      get7x7matrixFromBinaryString(letter7x7BinaryString)
    );

    letter = nextChar(letter);
  }
};

let getCharBinaryPixelMap = (char) => {
  let matrix = letterMatrices[char];
  return process7x7matrixToBinaryString(matrix);
};

let process7x7matrix = (matrix) => {
  matrix = rotate(matrix);
  return matrix;
};

let process7x7matrixToBinaryString = (matrix) => {
  let binStr = "";
  for (let i = 0; i < 7; i++) {
    for (let j = 6; j >= 0; j--) {
      binStr += matrix[i][j];
    }
  }

  return binStr;
};

let reverse = (matrix) => matrix.map((column) => column.reverse());

let rotate = (matrix) => transpose(reverse(matrix));

let get7x7matrixFromBinaryString = (letter7x7BinaryString) => {
  let matrix = math.zeros([7, 7]);
  let n = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      matrix[i][j] = letter7x7BinaryString[n++];
    }
  }
  return matrix;
};

let get7x7BinaryString = (letterBinaryString) => {
  let letterBinaryString7x7 = "";
  for (let i = 0; i <= 56; i++) {
    if (i % 8 !== 0) {
      letterBinaryString7x7 += letterBinaryString[i];
    }
  }

  return letterBinaryString7x7;
};

let nextChar = (c) => {
  return String.fromCharCode(c.charCodeAt(0) + 1);
};

run()
  .then((res) => console.log("done", res))
  .catch((ex) => console.error(ex));
