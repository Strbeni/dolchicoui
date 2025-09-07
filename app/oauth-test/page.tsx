"use client" 
import { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { selectUser, selectIsAuthenticated } from '@/lib/store/userSlice';

type ApiResult<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:3001';

const withCreds = (input: RequestInfo | URL, init: RequestInit = {}) => {
  return fetch(input, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
};

const safeJson = async (res: Response) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const now = () => new Date().toLocaleTimeString();

const TestOAuth: NextPage = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState<{
    health?: boolean;
    profile?: boolean;
    logout?: boolean;
    redirect?: boolean;
  }>({});

  const addResult = (message: string) => {
    setTestResults((prev) => [...prev, `${now()}: ${message}`]);
  };

  const api = useMemo(
    () => ({
      health: `${API_BASE}/api/auth/health`,
      profile: `${API_BASE}/api/auth/profile`,
      logout: `${API_BASE}/api/auth/logout`,
      google: `${API_BASE}/api/auth/google`,
    }),
    []
  );

  const testHealthCheck = async () => {
    setLoading((s) => ({ ...s, health: true }));
    try {
      const res = await withCreds(api.health);
      const body = await safeJson(res);
      if (!res.ok) {
        addResult(
          `Health Check: FAIL - HTTP ${res.status} ${res.statusText} - ${JSON.stringify(
            body
          )}`
        );
      } else {
        const ok =
          typeof body?.success === 'boolean' ? body.success : res.ok;
        addResult(
          `Health Check: ${ok ? 'PASS' : 'FAIL'} - ${
            body?.message || 'No message'
          }`
        );
      }
    } catch (err: any) {
      addResult(`Health Check: FAIL - ${String(err?.message || err)}`);
    } finally {
      setLoading((s) => ({ ...s, health: false }));
    }
  };

  const testProfile = async () => {
    setLoading((s) => ({ ...s, profile: true }));
    try {
      const res = await withCreds(api.profile);
      const body = await safeJson(res);
      if (!res.ok) {
        addResult(
          `Profile Test: FAIL - HTTP ${res.status} ${res.statusText} - ${JSON.stringify(
            body
          )}`
        );
      } else {
        const ok =
          typeof body?.success === 'boolean' ? body.success : res.ok;
        addResult(
          `Profile Test: ${ok ? 'PASS' : 'FAIL'} - ${JSON.stringify(body)}`
        );
      }
    } catch (err: any) {
      addResult(`Profile Test: FAIL - ${String(err?.message || err)}`);
    } finally {
      setLoading((s) => ({ ...s, profile: false }));
    }
  };

  const testLogout = async () => {
    setLoading((s) => ({ ...s, logout: true }));
    try {
      const res = await withCreds(api.logout, { method: 'POST' });
      const body = await safeJson(res);
      if (!res.ok) {
        addResult(
          `Logout Test: FAIL - HTTP ${res.status} ${res.statusText} - ${JSON.stringify(
            body
          )}`
        );
      } else {
        const ok =
          typeof body?.success === 'boolean' ? body.success : res.ok;
        addResult(
          `Logout Test: ${ok ? 'PASS' : 'FAIL'} - ${body?.message || 'Done'}`
        );
        if (ok) {
          window.location.reload(); // Refresh to update UI
        }
      }
    } catch (err: any) {
      addResult(`Logout Test: FAIL - ${String(err?.message || err)}`);
    } finally {
      setLoading((s) => ({ ...s, logout: false }));
    }
  };

  const testGoogleOAuth = () => {
    // Optional: pass a return URL so backend can redirect here after setting cookies
    // e.g., backend reads ?returnUrl and uses it for final redirect
    const returnUrl =
      typeof window !== 'undefined'
        ? encodeURIComponent(window.location.href)
        : '';
    const url =
      returnUrl && api.google.indexOf('?') === -1
        ? `${api.google}?returnUrl=${returnUrl}`
        : api.google;

    setLoading((s) => ({ ...s, redirect: true }));
    window.location.href = url;
  };

  // If backend redirected back with ?loggedIn=1, re-check auth to show user info
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('loggedIn') === '1') {
      // Auth state will be updated automatically through Redux
      window.location.reload();
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">OAuth Testing Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Auth Status</h2>
          {user ? (
            <div className="space-y-2">
              <p>
                <strong>Authenticated:</strong> ✅ Yes
              </p>
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
          ) : (
            <p className="text-red-600">❌ Not authenticated</p>
          )}
          <p className="mt-3 text-xs text-gray-500">
            API: {API_BASE}
          </p>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-3">
            <button
              onClick={testHealthCheck}
              disabled={!!loading.health}
              className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-60`}
            >
              {loading.health ? 'Testing Health…' : 'Test Health Check'}
            </button>

            <button
              onClick={testProfile}
              disabled={!!loading.profile}
              className={`w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-60`}
            >
              {loading.profile ? 'Testing Profile…' : 'Test Profile Endpoint'}
            </button>

            <button
              onClick={testGoogleOAuth}
              disabled={!!loading.redirect}
              className={`w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-60`}
            >
              {loading.redirect ? 'Redirecting…' : 'Test Google OAuth'}
            </button>

            {user && (
              <button
                onClick={testLogout}
                disabled={!!loading.logout}
                className={`w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 disabled:opacity-60`}
              >
                {loading.logout ? 'Logging out…' : 'Test Logout'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
          {testResults.length > 0 ? (
            testResults.map((result, index) => (
              <div key={index} className="mb-1 font-mono text-sm">
                {result}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No test results yet. Run some tests!</p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setTestResults([])}
            className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 text-sm"
          >
            Clear Results
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-500 text-white py-1 px-3 rounded hover:bg-indigo-600 text-sm"
          >
            Refresh Auth
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestOAuth;
