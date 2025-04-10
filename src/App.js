import React, { useState, useEffect } from 'react';
import { signInWithRedirect, signOut, getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { 
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';

// カスタムテーマの作成
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokens, setTokens] = useState(null);
  const [showToken, setShowToken] = useState(false);

  // 認証状態をチェックする
  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      console.log('currentUser:', currentUser);      
      try {
        const attributes = await fetchUserAttributes();
        const session = await fetchAuthSession();
        setUser({ 
          username: currentUser.username,
          attributes
        });
        // トークン情報を保存
        if (session && session.tokens) {
          setTokens({
            idToken: session.tokens.idToken,
            accessToken: session.tokens.accessToken
          });
        }
        setIsAuthenticated(true);
      } catch (attrError) {
        console.error('属性の取得に失敗:', attrError);
        setUser({ username: currentUser.username, attributes: {} });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.log('未認証状態です - ログインが必要です');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  // URLパラメータを確認し、エラーがあれば表示
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const errorDescription = queryParams.get('error_description');
    const error = queryParams.get('error');
    
    if (error) {
      setError(`認証エラー: ${error} (${errorDescription || '詳細不明'})`);
      console.error('認証エラー:', error, errorDescription);
    }
  }, []);

  // マネージドログインにリダイレクト
  async function handleSignIn() {
    try {
      console.log('マネージドログインへリダイレクトを開始します...');
      
      // エラーをクリア
      setError('');
      
      // リダイレクトを実行
      await signInWithRedirect({
        options:{
          lang : "ja"
        }
      });
    } catch (err) {
      console.error('サインインリダイレクトエラー:', err);
      setError(`サインインエラー: ${err.message}`);
    }
  }

  // サインアウト処理
  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      console.log('サインアウト成功');
    } catch (err) {
      console.error('サインアウトエラー:', err);
      setError(`サインアウトエラー: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            読み込み中...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box py={4}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            マネージドログインサンプル
          </Typography>
          <Divider sx={{ mb: 4 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {!isAuthenticated ? (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Box textAlign="center">
                <Typography variant="h5" gutterBottom>
                  認証が必要です
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={handleSignIn}
                  sx={{ mt: 2, mb: 4 }}
                >
                  Cognitoでサインイン
                </Button>
                
                <Card variant="outlined" sx={{ mt: 3, bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      設定情報（開発用）
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Region"
                          secondary={process.env.REACT_APP_REGION || '未設定'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="User Pool ID"
                          secondary={process.env.REACT_APP_USER_POOL_ID ? '設定済み' : '未設定'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Client ID"
                          secondary={process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID ? '設定済み' : '未設定'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Domain"
                          secondary={process.env.REACT_APP_COGNITO_DOMAIN ? '設定済み' : '未設定'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Redirect URL"
                          secondary={process.env.REACT_APP_REDIRECT_SIGN_IN || '未設定'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Box textAlign="center">
                <Typography variant="h5" gutterBottom>
                  ようこそ！
                </Typography>
                
                <Card sx={{ mt: 3, mb: 4, textAlign: 'left' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      <AccountCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      ユーザー情報
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="ユーザーID"
                          secondary={user.username}
                        />
                      </ListItem>
                      {user.attributes.email && (
                        <ListItem>
                          <ListItemText
                            primary="メールアドレス"
                            secondary={user.attributes.email}
                          />
                        </ListItem>
                      )}
                      {user.attributes.name && (
                        <ListItem>
                          <ListItemText
                            primary="名前"
                            secondary={user.attributes.name}
                          />
                        </ListItem>
                      )}
                    </List>
                    
                    {tokens && (
                      <Box mt={2}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          認証トークン
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => setShowToken(!showToken)}
                          sx={{ mb: 1 }}
                        >
                          {showToken ? 'トークンを隠す' : 'IDトークンを表示'}
                        </Button>
                        
                        {showToken && (
                          <Box 
                            sx={{ 
                              mt: 1, 
                              p: 2, 
                              bgcolor: '#f0f0f0', 
                              borderRadius: 1,
                              overflowX: 'auto',
                              fontSize: '0.75rem'
                            }}
                          >
                            <Typography variant="caption" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              ID Token:
                            </Typography>
                            <Box component="pre" sx={{ m: 0, wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                              {tokens.idToken.toString()}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
                
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<LogoutIcon />}
                  onClick={handleSignOut}
                >
                  サインアウト
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;