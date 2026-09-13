import mongoose from 'mongoose';
import User from '../models/User';
import System from '../models/System';
import ESP from '../models/ESP';
import Prediction from '../models/Prediction';
import { connectDB } from '../lib/db';

const SAMPLE_PASSWORD_HASH =
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

async function seed() {
  await connectDB();

  const collections = ['users', 'systems', 'esps', 'predictions'];
  for (const name of collections) {
    const count = await mongoose.connection.collection(name).countDocuments();
    if (count > 0) {
      console.log(`[seed] "${name}" already contains data - skipping.`);
      return;
    }
  }

  const espOne = await ESP.create({
    readings: [
      {
        type: 'temperature',
        node: 1,
        value: [21.6, 21.9, 22.1, 22.4],
        date: new Date(),
        time: '14:32:07',
      },
      {
        type: 'humidity',
        node: 2,
        value: [58.1, 57.9, 58.3],
        date: new Date(),
        time: '14:32:07',
      },
    ],
    devices: ['sensor-temperature-a', 'sensor-humidity-a'],
    health: { status: 'online', desc: 'All sensors reporting normally' },
  });

  const espTwo = await ESP.create({
    readings: [
      {
        type: 'humidity',
        node: 2,
        value: [44.2, 44.6, 44.1],
        date: new Date(),
        time: '14:33:12',
      },
    ],
    devices: ['sensor-humidity-a'],
    health: { status: 'degraded', desc: 'Intermittent readings on node 2' },
  });

  const systemOne = await System.create({
    users: [],
    commands: [
      { command: 'setTargetTemp', value: '22.0' },
      { command: 'setPowerMode', value: 'eco' },
      { command: 'calibrateSensors', value: 'auto' },
    ],
    ESPs: [espOne._id, espTwo._id],
  });

  const systemTwo = await System.create({
    users: [],
    commands: [{ command: 'setTargetTemp', value: '19.5' }],
    ESPs: [espTwo._id],
  });

  await User.create({
    Name: 'Ada Lovelace',
    Mail: 'ada@mutau.dev',
    Password: SAMPLE_PASSWORD_HASH,
    Systems: [systemOne._id],
    Data: [],
  });

  await User.create({
    Name: 'Alan Turing',
    Mail: 'alan@mutau.dev',
    Password: SAMPLE_PASSWORD_HASH,
    Systems: [systemTwo._id],
    Data: [],
  });

  await Prediction.create({
    system: systemOne._id,
    predictions: [
      { name: 'temperature-forecast', values: [22.1, 22.7, 23.0, 23.4] },
      { name: 'power-forecast', values: [48.2, 51.0, 49.7, 52.3] },
    ],
  });

  console.log('[seed] Database initialized with example data:');
  console.log(`  users:       ${await User.countDocuments()}`);
  console.log(`  systems:     ${await System.countDocuments()}`);
  console.log(`  esps:        ${await ESP.countDocuments()}`);
  console.log(`  predictions: ${await Prediction.countDocuments()}`);
}

(async () => {
  try {
    await seed();
  } catch (error) {
    console.error('[seed] Failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();