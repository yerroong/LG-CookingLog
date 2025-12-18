"use client";

import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import RecipeSection from "./components/RecipeSection";
import HomeCtaSection from "./components/CtaSection";
import styles from "./Home.module.css";

export default function HomePage() {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const fullText = "당신의 레시피를 공유해보세요! 쿠킹로그와 함께해요";

  useEffect(() => {
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
        // 타이핑 완료 후 바로 컨텐츠 표시
        setShowContent(true);
        // 타이핑 완료 후 3초 더 커서 유지
        setTimeout(() => {
          setShowCursor(false);
        }, 3000);
      }
    }, 100); // 100ms마다 한 글자씩

    return () => clearInterval(typingInterval);
  }, [fullText]);

  // "쿠킹로그" 부분을 찾아서 스타일 적용하고 줄바꿈 추가
  const renderText = () => {
    const cookingLogIndex = displayedText.indexOf("쿠킹로그");
    if (cookingLogIndex === -1) {
      return displayedText;
    }

    const beforeCookingLog = displayedText.slice(0, cookingLogIndex);
    const cookingLog = displayedText.slice(cookingLogIndex, cookingLogIndex + 4);
    const afterCookingLog = displayedText.slice(cookingLogIndex + 4);

    // "공유해보세요!" 다음에 줄바꿈 추가
    const parts = beforeCookingLog.split("공유해보세요!");
    
    return (
      <>
        {parts[0]}공유해보세요!
        {parts[1] && <><br />{parts[1]}</>}
        <span className={styles.highlight}>{cookingLog}</span>
        {afterCookingLog}
      </>
    );
  };

  return (
    <main>
      {/* 메인 타이틀 - 타이핑 효과 */}
      <section className={styles.titleSection}>
        <h1 className={styles.title}>
          {renderText()}
          {showCursor && <span className={styles.cursor}>|</span>}
        </h1>
      </section>

      {/* 타이핑 완료 후 나머지 컨텐츠 표시 */}
      {showContent && (
        <>
          <Hero />

          {/* 최신 레시피 */}
          <RecipeSection
            label="요리 초보라면? 이것부터 보세요!"
            title="최신 레시피 보기"
            type="recent"
          />

          {/* 인기 레시피 */}
          <RecipeSection
            label="과연 이번주 인기레시피는?"
            title="인기 레시피 보기"
            type="popular"
          />
          
          <HomeCtaSection />
        </>
      )}
    </main>
  );
}
