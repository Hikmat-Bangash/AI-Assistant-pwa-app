import React, { useEffect, useRef, useState } from "react";
import { Send } from "react-feather";
import robotIcon from "./robot.png";

import styles from "./App.module.css";

function App() {
  const defaultMsg = [{
    from: "ai",
    text: "Hi there! I'm your AI Assistant, I'm here to help you out with your questions. Ask me anything you want",
  }]
// when the very first time someone visit to our site, there must be a message to show. So the below logic has built for this purpose.
  if (!JSON.parse(localStorage.getItem('messages'))) {
  
    localStorage.setItem("messages", JSON.stringify(defaultMsg));
  }

  const lastMsg = useRef();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState( JSON.parse(localStorage.getItem('messages')) );
  const [processing, setProcessing] = useState(false);
  
  // handleSubmission method definition when user submit their query
  const handleSubmission = async () => {
    if (!messageText.trim() || processing) return;

    const tempMessages = [
      ...messages,
      {
        from: "human",
        text: messageText,
      },
      
    ];

    localStorage.setItem("messages", JSON.stringify(tempMessages));
    setMessages(tempMessages)

    setMessageText("");

    setTimeout(() =>
      lastMsg.current.scrollIntoView({
        behavior: "smooth",
      })
    );
   
    try {
      setProcessing(true);
      const res = await fetch(`https://ai-assistant-server.vercel.app/chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messages: tempMessages.slice(-6),
        }),
      });
      setProcessing(false);

      const data = await res.json();
      const ans = data.data;

      const response = {
        from: "ai",
        text: ans,
      }
      const allMessages = JSON.parse(localStorage.getItem('messages'));
      allMessages.push(response)
      setMessages(allMessages)
      localStorage.setItem("messages", JSON.stringify(allMessages));

    } catch (err) {
      const error = "Something went wrong, please try again.";
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: error,
        },
      ]);
    }    
  };
  // clear chat 
  const ClearChat = () => {
    // remove all history from localstorage
    localStorage.setItem("messages", JSON.stringify(defaultMsg));
    setMessages([{
      from: "ai",
      text: "Hi there! I'm your AI Assistant, I'm here to help you out with your questions. Ask me anything you want",
    }]);
  }

  useEffect(() => {

    setTimeout(() =>
      lastMsg.current.scrollIntoView({
        behavior: "smooth",
      })
    );
  }, [messages])

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.image}>
            <img src={robotIcon} alt="AI" />
          </div>
          <p>AI Assistant</p>
        </div>
        {/* header right side */}
        <div className={styles.right}>
              <p onClick={ClearChat}>Clear</p>
        </div>
        
      </div>

      <div className={styles.body}>
        {messages.map((msg, index) => (
          <div
            className={`${styles.message} ${
              msg.from === "ai" ? styles.mLeft : styles.mRight
            }`}
            key={index}
          >
            {msg.from === "ai" ? (
              <div>
                <div className={styles.image}>
                  <img src={robotIcon} alt="AI" />
                </div>
              </div>
            ) : (
              ""
            )}
            <p className={styles.text}>{msg.text}</p>
          </div>
        ))}

        {processing ? (
          <div className={styles.typing}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
        ) : (
          ""
        )}

        <div ref={lastMsg} />  </div>

      <div className={styles.footer}>
        <input
          placeholder="Type here..."
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          onKeyUp={(event) => (event.key === "Enter" ? handleSubmission() : "")}
        />

        <div className={styles.btn} onClick={handleSubmission}>
          <div className={styles.icon}>
            <Send />
          </div>
        </div>
      </div>
      {/* developed and designed  */}
      <div className={styles.developer}>
        <p>Developed and designed by <span className={styles.devName}>
          Hikmat Bangash
        </span></p>
      </div>
      
    </div>
  );
}

export default App;
