# S3 Access Troubleshooting Guide

## Error: "All access to this object has been disabled"

This error indicates that your S3 bucket has restrictive access policies that are blocking uploads. Here's how to fix it:

## 🔍 **Diagnostic Steps**

### 1. Check Environment Variables
Ensure these are set correctly in your `.env.local`:

```bash
# S3 Bucket Configuration (Improved naming)
S3_BUCKET_NAME=your-actual-bucket-name
S3_BUCKET_ACCESS_KEY=your-actual-access-key
S3_BUCKET_SECRET_KEY=your-actual-secret-key
S3_BUCKET_AWS_REGION=ap-northeast-2  # Seoul region - matches your config
S3_BUCKET_DOMAIN_URL=https://your-domain.com

# Note: These are server-side variables (more secure than NEXT_PUBLIC_)
```

### 2. Verify S3 Bucket Exists
- Go to AWS S3 Console
- Check if the bucket name matches exactly
- **Important**: Ensure the bucket is in the **ap-northeast-2 (Seoul)** region
- If your bucket is in a different region, update `S3_BUCKET_AWS_REGION` accordingly

### 3. Check IAM User Permissions
Your IAM user needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

## 🛠️ **Fix S3 Bucket Access**

### Option 1: Update Bucket Policy (Recommended)

1. Go to AWS S3 Console
2. Select your bucket
3. Go to "Permissions" tab
4. Click "Bucket policy"
5. Replace with this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowPublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/dropiti_uploads/*"
        },
        {
            "Sid": "AllowAuthenticatedUploads",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/YOUR-IAM-USERNAME"
            },
            "Action": [
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/dropiti_uploads/*"
        }
    ]
}
```

**Important**: Replace `YOUR-ACCOUNT-ID` and `YOUR-IAM-USERNAME` with your actual values.

### Option 2: Disable Block Public Access

1. Go to AWS S3 Console
2. Select your bucket
3. Go to "Permissions" tab
4. Click "Block public access (bucket settings)"
5. Uncheck all options:
   - [ ] Block all public access
   - [ ] Block public access to buckets and objects granted through new access control lists (ACLs)
   - [ ] Block public access to buckets and objects granted through any access control lists (ACLs)
   - [ ] Block public access to buckets and objects granted through new public bucket or access point policies
   - [ ] Block public access to buckets and objects granted through any public bucket or access point policies
6. Click "Save changes"

### Option 3: Update CORS Configuration

1. Go to AWS S3 Console
2. Select your bucket
3. Go to "Permissions" tab
4. Click "Cross-origin resource sharing (CORS)"
5. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## 🔐 **IAM User Setup**

### 1. Create IAM User
1. Go to AWS IAM Console
2. Click "Users" → "Add user"
3. Enter username (e.g., `dropiti-s3-upload`)
4. Select "Programmatic access"

### 2. Attach Policy
1. Click "Attach existing policies directly"
2. Search for "AmazonS3FullAccess" or create custom policy
3. For custom policy, use this:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

### 3. Get Credentials
1. Complete user creation
2. Copy the Access Key ID and Secret Access Key
3. Add to your `.env.local` file

## 🧪 **Test S3 Access**

### 1. Test with AWS CLI
```bash
# Install AWS CLI
aws configure

# Configure with your region (Seoul)
aws configure set region ap-northeast-2

# Test bucket access
aws s3 ls s3://your-bucket-name

# Test upload
aws s3 cp test.txt s3://your-bucket-name/dropiti_uploads/test/
```

### 2. Test with AWS Console
1. Go to S3 Console
2. **Ensure you're in the Seoul (ap-northeast-2) region**
3. Navigate to your bucket
4. Try to upload a test file manually
5. Check if you can create folders

## 🌏 **Region-Specific Configuration (Seoul - ap-northeast-2)**

### AWS Console Region Selection
- **Always select**: Asia Pacific (Seoul) ap-northeast-2
- **URL should contain**: `ap-northeast-2` in the console URL
- **Bucket location**: Must match this region

### Performance Benefits
- **Lower latency** for users in Asia Pacific
- **Faster uploads** from your location
- **Better compliance** with local data regulations

## 🚨 **Common Issues & Solutions**

### Issue: "Access Denied"
**Solution**: Check IAM user permissions and bucket policy

### Issue: "NoSuchBucket"
**Solution**: Verify bucket name and region

### Issue: "InvalidAccessKeyId"
**Solution**: Check access key in environment variables

### Issue: "SignatureDoesNotMatch"
**Solution**: Check secret key in environment variables

### Issue: "AllAccessDisabled"
**Solution**: Update bucket policy and disable block public access

## 🔄 **Alternative: Use Presigned URLs**

If direct upload continues to fail, you can use presigned URLs:

### 1. Update Environment Variables
```bash
# Add this to your .env.local
UPLOAD_METHOD=presigned
```

### 2. Modify Upload Flow
The system will automatically fall back to presigned URLs if direct upload fails.

## 📋 **Checklist**

- [ ] Environment variables are set correctly:
  - [ ] `S3_BUCKET_NAME` = your actual bucket name
  - [ ] `S3_BUCKET_ACCESS_KEY` = your IAM user access key
  - [ ] `S3_BUCKET_SECRET_KEY` = your IAM user secret key
  - [ ] `S3_BUCKET_AWS_REGION` = ap-northeast-2 (Seoul)
  - [ ] `S3_BUCKET_DOMAIN_URL` = your domain URL
- [ ] S3 bucket exists and is accessible
- [ ] **Bucket is in ap-northeast-2 (Seoul) region**
- [ ] IAM user has correct permissions
- [ ] Bucket policy allows uploads
- [ ] Block public access is disabled
- [ ] CORS is configured correctly
- [ ] Bucket region matches `S3_BUCKET_AWS_REGION` environment variable

## 🆘 **Still Having Issues?**

1. **Check AWS CloudTrail** for detailed error logs
2. **Verify bucket ownership** - ensure you own the bucket
3. **Check account status** - ensure your AWS account is active
4. **Contact AWS Support** if the issue persists

## 🔧 **Quick Fix Commands**

### Update Bucket Policy (AWS CLI)
```bash
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://bucket-policy.json
```

### Disable Block Public Access (AWS CLI)
```bash
aws s3api put-public-access-block --bucket your-bucket-name --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### Test Upload (AWS CLI)
```bash
aws s3 cp test.txt s3://your-bucket-name/dropiti_uploads/test/
```

## 📞 **Need Help?**

If you're still experiencing issues after following this guide:
1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Test S3 access with AWS CLI
4. Check AWS CloudTrail for detailed logs
