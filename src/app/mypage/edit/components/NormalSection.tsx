'use client';

import { useEffect, useState } from 'react';
import css from '../css/NormalSection.module.css';

interface LocalUser {
  id: number;
  nickname: string;
  phoneNumber: string;
}

/* ======================
  닉네임 중복 확인 API
====================== */
const checkNicknameDuplicate = async (
  nickname: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(
      `https://after-ungratifying-lilyanna.ngrok-free.dev/api/users/check-nickname/${nickname}`,
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      if (data.isDuplicate === false) {
        return { success: true, message: "사용 가능한 닉네임입니다!" };
      } else {
        return { success: false, message: "이미 사용 중인 닉네임입니다." };
      }
    }

    return { success: false, message: "중복 확인에 실패했습니다." };
  } catch (error) {
    console.error("닉네임 중복 확인 오류:", error);
    return { success: false, message: "서버와 연결할 수 없습니다." };
  }
};

const NormalSection = () => {
  const [userId, setUserId] = useState<number | null>(null);

  const [form, setForm] = useState({
    nickname: '',
    phoneNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({ type: null, text: '' });

  /* localStorage 불러오기 */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    const user: LocalUser = JSON.parse(storedUser);

    setUserId(user.id);

    setForm({
      nickname: user.nickname ?? '',
      phoneNumber: user.phoneNumber ?? '',
    });
  }, []);

  /* 입력 변경 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));

    // 닉네임 수정 시 중복확인 초기화
    if (name === 'nickname') {
      setNicknameCheckMsg({ type: null, text: '' });
    }
  };

  /* =======================
     닉네임 중복 확인
  ======================== */
  const handleCheckNickname = async () => {
    if (!form.nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      setCheckingNickname(true);

      const result = await checkNicknameDuplicate(form.nickname.trim());

      setNicknameCheckMsg({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });

    } catch (err) {
      setNicknameCheckMsg({
        type: 'error',
        text: '중복 확인 중 오류 발생',
      });
    } finally {
      setCheckingNickname(false);
    }
  };

  /* =======================
       저장
  ======================== */
  const handleSave = async () => {
    if (!userId) {
      alert('사용자 정보를 불러올 수 없습니다.');
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        nickname: form.nickname,
        phoneNumber: form.phoneNumber,
      };

      const res = await fetch(
        `https://after-ungratifying-lilyanna.ngrok-free.dev/api/users/${userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const storedUser = JSON.parse(localStorage.getItem('user')!);

      localStorage.setItem(
        'user',
        JSON.stringify({
          ...storedUser,
          nickname: form.nickname,
          phoneNumber: form.phoneNumber,
        })
      );

      window.dispatchEvent(new Event("userUpdated"));

      alert('회원 정보가 저장되었습니다.');
    } catch (error) {
      console.error(error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.container}>
      <h1>회원 정보</h1>

      <section className={css.main}>
        <h3 className={css.title}>기본 정보</h3>

        {/* 닉네임 */}
        <h4>닉네임</h4>
        <div className={css.row}>
          <input
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
          />

          <button
            type="button"
            onClick={handleCheckNickname}
            disabled={checkingNickname}
            className={css.checkBtn}
          >
            {checkingNickname ? "확인 중..." : "중복 확인"}
          </button>
        </div>

        {/* 중복 확인 메시지 */}
        {nicknameCheckMsg.type && (
          <p
            className={
              nicknameCheckMsg.type === 'success'
                ? css.successMsg
                : css.errorMsg
            }
          >
            {nicknameCheckMsg.text}
          </p>
        )}

        {/* 휴대폰 */}
        <h4>휴대폰 번호</h4>
        <input
          type="text"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          onFocus={(e) => e.target.select()}
        />

        <button onClick={handleSave} disabled={loading} className={css.saveBtn}>
          {loading ? '저장 중...' : '저장'}
        </button>
      </section>
    </div>
  );
};

export default NormalSection;
