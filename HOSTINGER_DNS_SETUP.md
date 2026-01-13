# How to Update DNS in Hostinger for Vercel

## Step-by-Step Instructions

### 1. Get DNS Records from Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project → **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `valuation.clarus24.net`
5. Vercel will show you DNS records to add

**You'll see something like:**
```
Type: CNAME
Name: valuation
Value: cname.vercel-dns.com
```

OR

```
Type: A
Name: valuation
Value: 76.76.21.21
```

---

### 2. Update DNS in Hostinger

#### Method A: Using Hostinger hPanel

1. **Login to Hostinger:**
   - Go to: https://hpanel.hostinger.com
   - Login with your credentials

2. **Navigate to DNS Zone Editor:**
   - Click **Domains** in the left menu
   - Click on **clarus24.net**
   - Click **DNS / Name Servers** tab
   - Click **Manage DNS Records** or **DNS Zone Editor**

3. **Add CNAME Record:**
   - Click **Add Record** or **+ Add**
   - Select **CNAME** from the Type dropdown
   - **Name/Host:** Enter `valuation` (without the domain)
   - **Points to/Target:** Enter `cname.vercel-dns.com` (from Vercel)
   - **TTL:** Leave default (usually 3600)
   - Click **Save** or **Add Record**

4. **Wait for DNS Propagation:**
   - DNS changes take 5-60 minutes to propagate
   - You can check status at: https://dnschecker.org

---

#### Method B: Using Hostinger Domain Manager

1. **Login to Hostinger:**
   - Go to: https://hpanel.hostinger.com

2. **Go to Domain Manager:**
   - Click **Domains** → **Manage**
   - Find **clarus24.net** → Click **Manage**

3. **Access DNS Settings:**
   - Look for **DNS Zone** or **DNS Records**
   - Click **Edit DNS Zone** or **Manage DNS**

4. **Add the Record:**
   - Click **Add Record**
   - Type: **CNAME**
   - Name: `valuation`
   - Value: `cname.vercel-dns.com`
   - Save

---

### 3. Verify DNS is Working

After adding the DNS record:

1. **Wait 5-10 minutes** for DNS propagation
2. **Check DNS propagation:**
   - Go to: https://dnschecker.org
   - Enter: `valuation.clarus24.net`
   - Select **CNAME** record type
   - Check if it shows `cname.vercel-dns.com`

3. **Test your domain:**
   - Visit: https://valuation.clarus24.net
   - Should load your Vercel app

---

## Troubleshooting

### If DNS doesn't work after 1 hour:

1. **Check DNS records in Hostinger:**
   - Make sure the CNAME record is exactly:
     - Name: `valuation` (NOT `valuation.clarus24.net`)
     - Value: `cname.vercel-dns.com`

2. **Remove conflicting records:**
   - If there's an A record for `valuation`, delete it
   - CNAME and A records can't coexist

3. **Check Vercel domain status:**
   - Go to Vercel → Settings → Domains
   - Check if domain shows "Valid Configuration"
   - If it shows an error, click to see what's wrong

4. **Try using A record instead:**
   - If CNAME doesn't work, Vercel also provides A records
   - Use the IP address Vercel gives you (usually `76.76.21.21`)

---

## Quick Reference

**CNAME Record:**
```
Type: CNAME
Name: valuation
Value: cname.vercel-dns.com
TTL: 3600 (default)
```

**A Record (Alternative):**
```
Type: A
Name: valuation
Value: 76.76.21.21
TTL: 3600 (default)
```

---

## Important Notes

- ⚠️ **Don't add `clarus24.net` to the Name field** - just `valuation`
- ⚠️ **CNAME records can't coexist with A records** for the same subdomain
- ⚠️ **DNS changes take time** - be patient (5-60 minutes)
- ✅ **Vercel provides free SSL** - no need to set up certificates

---

## Need Help?

If DNS still doesn't work:
1. Check Vercel dashboard for domain status
2. Verify DNS records match exactly what Vercel shows
3. Wait longer (sometimes takes up to 24 hours)
4. Contact Hostinger support if DNS editor isn't working
