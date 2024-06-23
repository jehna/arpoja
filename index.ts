import { randomBytes } from "crypto";

class LotterySimulator {
  private static WINNING_COMBINATIONS: { [key: number]: number } = {
    100000: 5,
    2000: 40,
    1000: 160,
    500: 1000,
    30: 16000,
    20: 80000,
    10: 180000,
    5: 240000,
    4: 250000,
  };

  private static TOTAL_TICKETS = 3000000;
  private static TICKET_PRICE = 4;

  private totalSpent: number = 0;
  private totalWins: number = 0;
  private winnings: { [key: number]: number } = {};
  private numTicketsBought: number = 0;

  constructor() {
    for (const prize in LotterySimulator.WINNING_COMBINATIONS) {
      this.winnings[prize] = 0;
    }
  }

  private getRandomPrize(): number {
    const totalTickets = LotterySimulator.TOTAL_TICKETS;
    const numBitsToRepresentTotalTickets = bitsToNextPowerOf2(totalTickets);
    const randomNumberBigInt = randomNumberWithBits(
      numBitsToRepresentTotalTickets
    );
    if (randomNumberBigInt > BigInt(totalTickets)) {
      return this.getRandomPrize();
    }
    return this.getPrize(randomNumberBigInt);
  }

  private getPrize(randomNumber: bigint): number {
    let totalTickets = 0;
    for (const prize in LotterySimulator.WINNING_COMBINATIONS) {
      totalTickets += LotterySimulator.WINNING_COMBINATIONS[prize];
      if (randomNumber <= BigInt(totalTickets)) {
        return parseInt(prize);
      }
    }
    return 0;
  }

  public runSimulation() {
    while (this.winnings[100000] === 0) {
      this.numTicketsBought++;
      this.totalSpent += LotterySimulator.TICKET_PRICE;
      const prize = this.getRandomPrize();
      if (prize > 0) {
        this.totalWins += prize;
        this.winnings[prize]++;
      }
    }

    this.displayResults();
  }

  public get revenue(): number {
    return this.totalWins - this.totalSpent;
  }

  private displayResults() {
    console.log(`Päävoitto saavutettu!`);
    console.log(`Käytetty rahaa: ${this.totalSpent} €`);
    console.log(`Voittoja yhteensä: ${this.totalWins} €`);
    console.log(`Näin monta arpaa ostit: ${this.numTicketsBought}`);
    console.log(
      `Jäit ${this.revenue > 0 ? "voitolle" : "tappiolle"} ${this.revenue} €`
    );
    console.log(`Voittojakauma:`);
    for (const prize in this.winnings) {
      console.log(`${prize} €: ${this.winnings[prize]} kpl`);
    }
  }
}

// run until positive revenue
let i = 0;
while (true) {
  i++;
  const simulator = new LotterySimulator();
  simulator.runSimulation();
  if (simulator.revenue > 0) {
    console.log(`Meni ${i} kierrosta kunnes jäit voitolle!`);
    break;
  }
}

function bitsToNextPowerOf2(n: number): number {
  let count = 0;

  while (n !== 0) {
    n >>= 1;
    count += 1;
  }

  return count;
}

function randomNumberWithBits(bits: number): bigint {
  const bytes = Math.ceil(bits / 8);
  const randomBytesBuffer = randomBytes(bytes);
  const randomBytesBigInt = BigInt(`0x${randomBytesBuffer.toString("hex")}`);

  // Truncate the number to the number of bits we want
  const mask = BigInt(2n ** BigInt(bits) - 1n);
  return randomBytesBigInt & mask;
}
