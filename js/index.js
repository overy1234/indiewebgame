document.addEventListener('DOMContentLoaded', async () => {
  const postsGrid = document.getElementById('posts-grid');

  try {
    // Supabase에서 게시물 목록 가져오기
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 로딩 상태 제거
    postsGrid.innerHTML = '';

    if (data.length === 0) {
      postsGrid.innerHTML = `
        <div class="no-posts">
          <i class="ri-file-list-3-line"></i>
          <p>아직 게시물이 없습니다. 첫 번째 글을 작성해보세요!</p>
        </div>
      `;
      return;
    }

    // 포스트 카드 생성 및 추가
    data.forEach(post => {
      const postCard = createPostCard(post);
      postsGrid.appendChild(postCard);
    });
  } catch (error) {
    showError(error.message);
    postsGrid.innerHTML = `
      <div class="error-message">
        <i class="ri-error-warning-line"></i>
        <p>게시물을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    `;
  }
});

// 포스트 카드 생성 함수
function createPostCard(post) {
  const article = document.createElement('article');
  article.className = 'post-card';
  
  // 포스트 내용에서 설명 추출
  const description = post.description || extractDescription(post.content);
  
  // HTML 구성
  article.innerHTML = `
    <a href="post.html?id=${post.id}" class="post-card-link">
      ${post.cover_image ? `
        <div class="post-card-image">
          <img src="${post.cover_image}" alt="${post.title}" loading="lazy">
        </div>
      ` : ''}
      <div class="post-card-content">
        <div class="post-card-meta">
          <span class="post-card-date"><i class="ri-calendar-line"></i> ${formatDate(post.created_at)}</span>
        </div>
        <h3 class="post-card-title">${post.title}</h3>
        <p class="post-card-description">${description}</p>
        <span class="read-more">더 보기</span>
      </div>
    </a>
  `;
  
  return article;
}

// 내용에서 설명 추출 함수
function extractDescription(content) {
  // 마크다운에서 첫 번째 단락만 추출
  const firstParagraph = content.split('\n\n')[0].replace(/[#*`]/g, '');
  
  // 150자로 제한
  if (firstParagraph.length <= 150) {
    return firstParagraph;
  } else {
    return firstParagraph.substring(0, 147) + '...';
  }
} 