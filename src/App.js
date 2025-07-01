// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";

const gridSize = 4;

const getRandomPos = (exclude = []) => {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (exclude.some((p) => p.x === pos.x && p.y === pos.y));
  return pos;
};

function App() {
  const [agent, setAgent] = useState({ x: 0, y: 0 });
  const [gold, setGold] = useState(null);
  const [hasGold, setHasGold] = useState(false);
  const [wumpus, setWumpus] = useState(null);
  const [wumpusAlive, setWumpusAlive] = useState(true);
  const [pits, setPits] = useState([]);
  const [arrowUsed, setArrowUsed] = useState(false);
  const [percepts, setPercepts] = useState([]);
  const [status, setStatus] = useState("Playing");
  const [message, setMessage] = useState("");

  const setupGame = () => {
    const goldPos = getRandomPos([{ x: 0, y: 0 }]);
    const wumpusPos = getRandomPos([{ x: 0, y: 0 }, goldPos]);
    const pitList = [];
    while (pitList.length < 3) {
      const pit = getRandomPos([{ x: 0, y: 0 }, goldPos, wumpusPos, ...pitList]);
      pitList.push(pit);
    }
    setAgent({ x: 0, y: 0 });
    setGold(goldPos);
    setWumpus(wumpusPos);
    setWumpusAlive(true);
    setPits(pitList);
    setHasGold(false);
    setArrowUsed(false);
    setPercepts([]);
    setStatus("Playing");
    setMessage("");
  };

  useEffect(() => {
    setupGame();
  }, []);

  const move = (dx, dy) => {
    if (status !== "Playing") return;
    const x = Math.min(Math.max(agent.x + dx, 0), gridSize - 1);
    const y = Math.min(Math.max(agent.y + dy, 0), gridSize - 1);
    setAgent({ x, y });
  };

  useEffect(() => {
    if (status !== "Playing") return;
    const near = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
    const senses = [];
    if (!hasGold && gold && agent.x === gold.x && agent.y === gold.y) senses.push("Glitter");
    if (wumpusAlive && wumpus && near(agent, wumpus)) senses.push("Stench");
    if (pits.some((p) => near(agent, p))) senses.push("Breeze");
    setPercepts(senses);

    if (wumpusAlive && wumpus && agent.x === wumpus.x && agent.y === wumpus.y) {
      setStatus("Lost");
      setMessage("💀 You were eaten by the Wumpus!");
    } else if (pits.some((p) => p.x === agent.x && p.y === agent.y)) {
      setStatus("Lost");
      setMessage("💀 You fell into a pit!");
    } else if (hasGold && agent.x === 0 && agent.y === 0) {
      setStatus("Won");
      setMessage("🎉 You returned home with the gold!");
    }
  }, [agent]);

  const pickUpGold = () => {
    if (gold && agent.x === gold.x && agent.y === gold.y && !hasGold) {
      setHasGold(true);
      setMessage("🪙 You picked up the gold!");
    }
  };

  const shootArrow = () => {
    if (arrowUsed || !wumpusAlive || status !== "Playing") return;
    setArrowUsed(true);
    const near = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
    if (near(agent, wumpus)) {
      setWumpusAlive(false);
      setMessage("🎯 You killed the Wumpus!");
    } else {
      setMessage("❌ You missed the Wumpus.");
    }
  };

  const sense = () => {
    const msg = percepts.length ? `👁️ You sense: ${percepts.join(", ")}` : "👁️ Nothing sensed.";
    setMessage(msg);
  };

  return (
    <div className="container">
      <h1>Wumpus World</h1>
      <h2 className={`status ${status.toLowerCase()}`}>Status: {status}</h2>
      {message && <p className="message">{message}</p>}

      <div className="grid">
        {[...Array(gridSize * gridSize)].map((_, i) => {
          const x = i % gridSize;
          const y = Math.floor(i / gridSize);
          const isAgent = agent.x === x && agent.y === y;
          const showGold = hasGold && x === 0 && y === 0;
          return (
            <div className="cell" key={i}>
              {isAgent ? "🧑" : ""}
              {showGold ? "🪙" : ""}
            </div>
          );
        })}
      </div>

      <div className="controls">
        <button onClick={() => move(0, -1)}>↑</button>
        <div>
          <button onClick={() => move(-1, 0)}>←</button>
          <button onClick={() => move(1, 0)}>→</button>
        </div>
        <button onClick={() => move(0, 1)}>↓</button>
      </div>

      <div className="actions">
        <button onClick={pickUpGold} disabled={hasGold || status !== "Playing"}>Pick Up Gold</button>
        <button onClick={shootArrow} disabled={arrowUsed || !wumpusAlive || status !== "Playing"}>Shoot Arrow</button>
        <button onClick={sense} disabled={status !== "Playing"}>Sense</button>
        <button onClick={setupGame}>🔄 Restart</button>
      </div>
    </div>
  );
}

export default App;
