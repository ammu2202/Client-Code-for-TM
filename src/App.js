import "./App.css";
import { contractAddress } from "./config";
import TaskAbi from "./TaskManager.json";
import { useState, useEffect } from "react";

import { ethers } from "ethers";
function App() {
  //for connect wallet
  const [isUserLoggedIn, setUserLoggedIn] = useState(false);
  const [currentsAccount, setCurrentAccount] = useState("");

  //for add tasks
  const [input, setInput] = useState(" ");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    connectWallet();
    getAllTasks();
  }, []);

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("metamask not detected");
        return;
      } else {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Found account", accounts[0]);
        setUserLoggedIn(true);
        setCurrentAccount(accounts[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getAllTasks = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          contractAddress,
          TaskAbi.abi,
          signer
        );

        let allTasks = await TaskContract.getTasks();
        let filtered = allTasks.filter((task) => task.isDeleted !== true);
        setTasks(filtered);
      } else {
        console.log("ethereum object does not exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addTasks = async (e) => {
    e.preventDefault(); //avoid refresh
    let task = {
      taskText: input,
      isDeleted: false,
    };
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          contractAddress,
          TaskAbi.abi,
          signer
        );

        TaskContract.addTask(task.taskText, task.isDeleted)
          .then((res) => {
            setTasks([...tasks, task]);
          })
          .catch((err) => {
            console.log(err);
          });
        setInput(" ");
      } else {
        console.log("ethereum object does not exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTask = (key) => async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          contractAddress,
          TaskAbi.abi,
          signer
        );

        const deleteTaskTx = await TaskContract.deleteTask(key, true);
        console.log("Successfully deleted: ", deleteTaskTx);

        const allTasks = await TaskContract.getTasks();
        let filtered = allTasks.filter((task) => task.isDeleted !== true);
        setTasks(filtered);
      } else {
        console.log("ethereum object does not exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      {!isUserLoggedIn && (
        <div className="connectWalletButton">
          <button onClick={connectWallet}>Connect</button>
        </div>
      )}

      {isUserLoggedIn && (
        <div className="inputform">
          <form>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={addTasks}>Submit</button>
          </form>
        </div>
      )}

      <div className="alltasks">
        {tasks.map((task) => {
          return (
            <div key={task.id}>
              <h1>
                {task.taskText}{" "}
                <span>
                  <button onClick={deleteTask(task.id)}>Delete</button>
                </span>
              </h1>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
