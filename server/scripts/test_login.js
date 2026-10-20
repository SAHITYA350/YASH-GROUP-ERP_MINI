async function test() {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@yash.test', password: 'Yash@Test123' }),
  });
  const data = await res.json();
  console.log('HTTP status:', res.status);
  console.log('Response:', data);
}

test().catch(console.error);
