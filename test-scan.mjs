fetch('http://localhost:3000/api/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ base64Image: "abc", mimeType: 'image/png' })
})
.then(res => res.text())
.then(data => {
   // Extract error message from Next.js HTML overlay if it exists
   const match = data.match(/<title>(.*?)<\/title>/);
   console.log("HTML Title:", match ? match[1] : "No title");
   console.log("Raw Response start:", data.substring(0, 200));
})
.catch(console.error);
