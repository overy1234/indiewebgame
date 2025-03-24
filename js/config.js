// Supabase 설정
const SUPABASE_URL = 'https://amejjiiaihsaqcivtnaa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZWpqaWlhaWhzYXFjaXZ0bmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NTg2OTUsImV4cCI6MjA1NjEzNDY5NX0.GluCTZYpEhp99tuF7yuhmQv_-XVZ8C5X21DcWH0K0SU';

// Supabase 클라이언트 초기화
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 유틸리티 함수
function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('ko-KR', options);
}

// 에러 핸들링
function showError(message) {
  console.error(message);
  alert(`오류가 발생했습니다: ${message}`);
} 