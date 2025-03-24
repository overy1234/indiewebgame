document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('auth-form');
  const authFormContainer = document.getElementById('auth-form-container');
  const writeFormContainer = document.getElementById('write-form-container');
  const postForm = document.getElementById('post-form');
  const submitBtn = document.getElementById('submit-btn');
  const titleInput = document.getElementById('title');
  const contentArea = document.getElementById('content');
  const descriptionArea = document.getElementById('description');
  
  // 요소 상태 확인 로그
  console.log('DOM이 로드되었습니다.');
  console.log('인증 폼:', authForm);
  console.log('글쓰기 폼 컨테이너:', writeFormContainer);
  console.log('글쓰기 폼:', postForm);
  console.log('컨텐츠 영역:', contentArea);
  
  // 인증 폼 제출 처리
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('인증 폼 제출됨');
    
    const password = document.getElementById('auth-password').value;
    console.log('입력된 비밀번호:', password);
    
    try {
      // Supabase에서 비밀번호 확인 (DB 연결이 안 되어 있어서 임시로 직접 비교)
      // const isAuthenticated = await checkAdminPassword(password);
      const isAuthenticated = password === '인디코드'; // 임시 인증 처리
      
      if (isAuthenticated) {
        // 인증 성공
        console.log('비밀번호 일치, 글쓰기 폼 표시');
        authFormContainer.style.display = 'none';
        writeFormContainer.style.display = 'block';
        
        // 약간의 지연 후 에디터 초기화 (DOM 업데이트 확인)
        setTimeout(() => {
          initEditor();
        }, 100);
      } else {
        // 인증 실패
        console.log('비밀번호 불일치');
        alert('비밀번호가 일치하지 않습니다.');
        document.getElementById('auth-password').value = '';
        document.getElementById('auth-password').focus();
      }
    } catch (error) {
      console.error('인증 오류:', error);
      alert('인증 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  });
  
  // 마크다운 에디터 초기화 함수
  function initEditor() {
    console.log('에디터 초기화 시작');
    
    // 에디터 요소 다시 확인
    const contentAreaCheck = document.getElementById('content');
    console.log('컨텐츠 영역 재확인:', contentAreaCheck);
    
    if (!contentAreaCheck) {
      console.error('content 요소를 찾을 수 없습니다.');
      alert('에디터 요소를 찾을 수 없습니다. 페이지를 새로고침하세요.');
      return;
    }
    
    try {
      const easyMDE = new EasyMDE({
        element: contentAreaCheck,
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
      
      console.log('에디터 초기화 완료:', easyMDE);
      
      // 숨겨진 파일 업로드 입력 생성
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      
      // 이미지 업로드 처리 함수
      function handleImageUpload() {
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
                
                // 파일명에서 확장자만 가져오기
                const fileExt = file.name.split('.').pop();
                const markdownImage = `![이미지](${imageUrl})`;
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
            console.error('이미지 업로드 오류:', error);
            alert(`이미지 업로드에 실패했습니다: ${error.message}`);
          }
          
          // 파일 입력 초기화
          fileInput.value = '';
        }
      });
    
      // 폼 제출 처리
      postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('글쓰기 폼 제출');
        
        // 입력값 가져오기
        const title = titleInput.value.trim();
        const content = easyMDE.value().trim();
        const description = descriptionArea.value.trim() || content.substring(0, 200).replace(/[#*`]/g, '');
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
          console.error('글 저장 오류:', error);
          alert(`글 저장에 실패했습니다: ${error.message}`);
          submitBtn.disabled = false;
          submitBtn.textContent = '게시하기';
        }
      });
    } catch (err) {
      console.error('에디터 초기화 오류:', err);
      alert('에디터 초기화에 실패했습니다. 페이지를 새로고침하세요.');
    }
  }
}); 