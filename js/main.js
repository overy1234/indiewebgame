document.addEventListener('DOMContentLoaded', async () => {
  const postsContainer = document.getElementById('posts-container');

  // 로딩 표시
  postsContainer.innerHTML = '<div class="loading">포스트를 불러오는 중...</div>';

  try {
    // Supabase에서 데이터 가져오기
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data.length === 0) {
      postsContainer.innerHTML = '<div class="no-posts">아직 게시물이 없습니다. 첫 번째 글을 작성해보세요!</div>';
      return;
    }

    // 데이터를 화면에 렌더링
    postsContainer.innerHTML = '';
    data.forEach(post => {
      const postElement = createPostCard(post);
      postsContainer.appendChild(postElement);
    });
  } catch (error) {
    showError(error.message);
    postsContainer.innerHTML = '<div class="error">포스트를 불러오는 중 오류가 발생했습니다.</div>';
  }
});

// 포스트 카드 요소 생성 함수
function createPostCard(post) {
  const postCard = document.createElement('a');
  postCard.className = 'post-card';
  postCard.href = `post.html?id=${post.id}`;

  // 기본 이미지 URL
  const imageUrl = post.cover_image || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  postCard.innerHTML = `
    <div class="post-image">
      <img src="${imageUrl}" alt="${post.title}" loading="lazy">
    </div>
    <div class="post-content">
      <div class="post-meta">
        <span class="post-date"><i class="ri-calendar-line"></i> ${formatDate(post.created_at)}</span>
      </div>
      <h2 class="post-title">${post.title}</h2>
      <p class="post-description">${post.description || post.content.substring(0, 150) + '...'}</p>
      <span class="read-more">계속 읽기</span>
    </div>
  `;

  return postCard;
} 