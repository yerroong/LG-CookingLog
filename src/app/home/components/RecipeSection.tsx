"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RecipeCard from "../../recipes/components/RecipeCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./RecipeSection.module.css";

interface Recipe {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  rating: number;
  category: string;
  tags: string[];
  userNickname: string;
  createdAt: string;
}

interface RecipeCardData {
  id: number;
  title: string;
  content: string;
  image: string;
  rating: number;
  category: string;
  hashtags: string[];
  author: string;
  createdAt: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const transformRecipe = (recipe: Recipe): RecipeCardData => {
  // 이미지 URL 처리: 상대 경로면 서버 URL 붙이기
  let imageUrl = recipe.imageUrl || "/images/default-recipe.jpg";
  if (imageUrl && imageUrl.startsWith("/uploads")) {
    imageUrl = `https://after-ungratifying-lilyanna.ngrok-free.dev${imageUrl}`;
  }

  return {
    id: recipe.id,
    title: recipe.title,
    content: recipe.content,
    image: imageUrl,
    rating: recipe.rating || 0,
    category: recipe.category,
    hashtags: recipe.tags?.map((tag) => `#${tag}`) || [],
    author: recipe.userNickname,
    createdAt: formatDate(recipe.createdAt),
  };
};

interface SimpleComment {
  rating: number;
  parentCommentId: number | null;
}

export default function RecipeSection({
  label,
  title,
  type,
}: {
  label: string;
  title: string;
  type: "recent" | "popular";
}) {
  const [recipes, setRecipes] = useState<RecipeCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // 댓글 기반 평균 별점 계산 함수 (대댓글 제외)
  const calculateAverageRating = (comments: SimpleComment[]) => {
    if (!comments || comments.length === 0) {
      return 0;
    }

    // 대댓글이 아닌 일반 댓글만 필터링 (parentCommentId가 null인 것)
    const mainComments = comments.filter(
      (comment) => comment.parentCommentId === null && comment.rating > 0
    );

    if (mainComments.length === 0) {
      return 0;
    }

    const sum = mainComments.reduce((acc, comment) => acc + comment.rating, 0);
    return Math.round((sum / mainComments.length) * 10) / 10;
  };

  // 개별 레시피의 댓글 평균 별점 가져오기
  const fetchRecipeRating = async (recipeId: number) => {
    try {
      const response = await fetch(
        `https://after-ungratifying-lilyanna.ngrok-free.dev/api/posts/${recipeId}/comments`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      if (response.ok) {
        const comments: SimpleComment[] = await response.json();
        return calculateAverageRating(comments);
      }
    } catch (error) {
      console.error(`레시피 ${recipeId} 별점 조회 실패:`, error);
    }
    return 0;
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(
          "https://after-ungratifying-lilyanna.ngrok-free.dev/api/posts",
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (response.ok) {
          const data: Recipe[] = await response.json();
          console.log(`[${type}] 레시피 원본 데이터:`, data);
          const transformedRecipes = data.map(transformRecipe);
          console.log(`[${type}] 변환된 레시피 데이터:`, transformedRecipes);

          // 각 레시피의 댓글 기반 평균 별점 가져오기
          const recipesWithRatings = await Promise.all(
            transformedRecipes.map(async (recipe) => {
              const avgRating = await fetchRecipeRating(recipe.id);
              return {
                ...recipe,
                rating: avgRating,
              };
            })
          );

          let sortedRecipes;
          if (type === "popular") {
            // 인기순: 평균 별점 기준 내림차순
            sortedRecipes = recipesWithRatings.sort((a, b) => b.rating - a.rating);
          } else {
            // 최신순: createdAt 기준 내림차순
            sortedRecipes = recipesWithRatings.sort((a, b) => {
              return (
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          }

          // 4개만 가져오기
          setRecipes(sortedRecipes.slice(0, 4));
        }
      } catch (error) {
        console.error("레시피 목록 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [type]);

  if (loading) {
    return (
      <section className={styles.section}>
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <span className={styles.label}>{label}</span>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <Link href="/recipes" className={styles.moreButton}>
          더 많은 레시피 보기
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className={styles.noResults}>
          <p>검색되는 결과가 없습니다</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onHashtagClick={() => {}}
            />
          ))}
        </div>
      )}
    </section>
  );
}
