document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('post-form');
  const submitBtn = document.getElementById('submit-btn');
  const titleInput = document.getElementById('title');
  const contentArea = document.getElementById('content');
  const descriptionArea = document.getElementById('description');
  
  // 마크다운 에디터 초기화
  const easyMDE = new EasyMDE({
    element: contentArea,
    spellChecker: false,
    autosave: {
      enabled: true,
      uniqueId: 'blogPostContent',
      delay: 1000,
    },
    placeholder: '마크다운을 사용하여 글을 작성하세요...',
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'code', 'unordered-list', 'ordered-list', '|',
      'link', {
        name: 'image',
        action: () => {
          handleImageUpload();
        },
        className: 'fa fa-image',
        title: '이미지 업로드',
      }, '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      'guide'
    ]
  });
  
  // 숨겨진 파일 업로드 입력 생성
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  
  // 이미지 업로드 처리 함수
  async function handleImageUpload() {
    fileInput.click();
  }
  
  // 파일 선택 시 이벤트
  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 로딩 메시지
      const cm = easyMDE.codemirror;
      const cursor = cm.getCursor();
      const loadingText = '![이미지 업로드 중...](uploading)';
      cm.replaceRange(loadingText, cursor);
      
      try {
        // 이미지 업로드 함수 호출
        const imageUrl = await uploadImage(file);
        
        if (imageUrl) {
          // 업로드된 이미지로 텍스트 교체
          const cursorPosition = cm.getCursor();
          const currentLine = cm.getLine(cursorPosition.line);
          const uploadingTextPosition = currentLine.indexOf('![이미지 업로드 중...](uploading)');
          
          if (uploadingTextPosition !== -1) {
            const from = {
              line: cursorPosition.line,
              ch: uploadingTextPosition
            };
            const to = {
              line: cursorPosition.line,
              ch: uploadingTextPosition + '![이미지 업로드 중...](uploading)'.length
            };
            
            const markdownImage = `![${file.name.replace(/\s+/g, '_')}](${imageUrl})`;
            cm.replaceRange(markdownImage, from, to);
          }
        } else {
          // 업로드 실패 시 로딩 텍스트 제거
          const cursorPosition = cm.getCursor();
          const currentLine = cm.getLine(cursorPosition.line);
          const uploadingTextPosition = currentLine.indexOf('![이미지 업로드 중...](uploading)');
          
          if (uploadingTextPosition !== -1) {
            const from = {
              line: cursorPosition.line,
              ch: uploadingTextPosition
            };
            const to = {
              line: cursorPosition.line,
              ch: uploadingTextPosition + '![이미지 업로드 중...](uploading)'.length
            };
            
            cm.replaceRange('', from, to);
          }
        }
      } catch (error) {
        showError(error.message);
      }
      
      // 파일 입력 초기화
      fileInput.value = '';
    }
  });

  // 폼 제출 처리
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 입력값 가져오기
    const title = titleInput.value.trim();
    const content = easyMDE.value().trim();
    const description = descriptionArea.value.trim() || content.substring(0, 200);
    const coverImage = document.getElementById('cover-image').value.trim();
    
    // 유효성 검사
    if (!title) {
      alert('제목을 입력해주세요.');
      titleInput.focus();
      return;
    }
    
    if (!content) {
      alert('내용을 입력해주세요.');
      easyMDE.codemirror.focus();
      return;
    }
    
    // 제출 버튼 비활성화 및 텍스트 변경
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';
    
    try {
      // Supabase에 데이터 저장
      const { data, error } = await supabaseClient
        .from('posts')
        .insert([
          {
            title,
            content,
            description,
            cover_image: coverImage || null,
            created_at: new Date().toISOString(),
            published: true
          }
        ]);
      
      if (error) throw error;
      
      // 저장 성공 시 홈페이지로 이동
      alert('글이 성공적으로 저장되었습니다!');
      window.location.href = 'index.html';
      
    } catch (error) {
      // 에러 처리
      showError(error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = '게시하기';
    }
  });
}); 