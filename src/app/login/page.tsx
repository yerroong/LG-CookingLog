"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./LoginPage.module.css";
import Popup from "./components/Popup";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const router = useRouter();

  const handleLogin = () => {
    const isValid = id === "test" && pw === "1234";

    if (!isValid) {
      setPopupMessage("아이디/비밀번호를 다시 확인해주세요.");
      setLoginSuccess(false);
      return;
    }

    // 로그인 성공
    localStorage.setItem(
      "user",
      JSON.stringify({ id, nickname: id }) // 닉네임 예시로 id 넣음
    );

    setPopupMessage(`${id}님, 로그인이 완료되었습니다!`);
    setLoginSuccess(true);
  };

  const handlePopupClose = () => {
    setPopupMessage(null);
    if (loginSuccess) {
      router.push("/home"); // 로그인 성공 후 이동
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>로그인하기</div>
      <div className={styles.subtitle}>가입한 아이디로 로그인하세요.</div>

      <div className={styles.divider} />

      <div className={styles.formBox}>
        <div className={styles.inputWrapper}>
          <img src="/icon/profile-gray-icon.svg" className={styles.icon} />
          <input
            type="text"
            placeholder="아이디를 입력하시오"
            className={styles.input}
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>

        <div className={styles.inputWrapper}>
          <img src="/icon/lock-icon.svg" className={styles.icon} />
          <input
            type="password"
            placeholder="비밀번호를 입력하시오"
            className={styles.input}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </div>

        <button className={styles.loginButton} onClick={handleLogin}>
          로그인
        </button>

        <div className={styles.signupWrapper}>
          <span className={styles.noAccount}>계정이 없으신가요?</span>
          <Link href="/signup" className={styles.signupLink}>
            회원가입
          </Link>
        </div>
      </div>

      {popupMessage && (
        <Popup message={popupMessage} onClose={handlePopupClose} />
      )}
    </div>
  );
}
