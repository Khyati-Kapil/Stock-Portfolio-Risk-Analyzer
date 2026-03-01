import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser } from '../api/riskApi';
import { useAuth } from '../auth/AuthContext';

function CallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  useEffect(() => {
    let ignore = false;

    async function handle() {
      const token = params.get('token');
      const error = params.get('error');

      if (error || !token) {
        navigate('/');
        return;
      }

      try {
        const profile = await getCurrentUser(token);
        if (!ignore) {
          completeLogin(token, profile);
          navigate('/app');
        }
      } catch (_err) {
        if (!ignore) navigate('/');
      }
    }

    handle();
    return () => {
      ignore = true;
    };
  }, [completeLogin, navigate, params]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0f19', color: '#e5ecff' }}>
      <div>Completing sign-in...</div>
    </div>
  );
}

export default CallbackPage;
