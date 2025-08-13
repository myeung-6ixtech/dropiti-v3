# 🏠 **Offer Negotiation System - Database Setup**

## 📋 **Overview**

This document provides the SQL commands needed to implement the comprehensive offer negotiation system for your Dropiti platform. The system supports a 3-round negotiation process between tenants and landlords.

---

## 🗄️ **Database Schema Updates**

### **1. Update the `real_estate_offer` Table**

Run these SQL commands in your Hasura console to add the new negotiation fields:

```sql
-- Add new columns to support negotiation workflow
ALTER TABLE real_estate_offer 
ADD COLUMN current_rent_price DECIMAL(10,2),
ADD COLUMN current_rent_price_currency VARCHAR(3) DEFAULT 'HKD',
ADD COLUMN current_num_leasing_months INTEGER,
ADD COLUMN current_payment_frequency VARCHAR(50),
ADD COLUMN current_move_in_date DATE,
ADD COLUMN negotiation_round INTEGER DEFAULT 0,
ADD COLUMN last_action_by VARCHAR(20) DEFAULT 'initiator',
ADD COLUMN last_action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN last_action_type VARCHAR(50),
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to set current values
UPDATE real_estate_offer 
SET 
  current_rent_price = proposing_rent_price,
  current_rent_price_currency = proposing_rent_price_currency,
  current_num_leasing_months = num_leasing_months,
  current_payment_frequency = payment_frequency,
  current_move_in_date = move_in_date,
  last_action_type = 'INITIATOR_CREATED'
WHERE current_rent_price IS NULL;

-- Add constraints
ALTER TABLE real_estate_offer 
ADD CONSTRAINT check_negotiation_round CHECK (negotiation_round >= 0 AND negotiation_round <= 2),
ADD CONSTRAINT check_last_action_by CHECK (last_action_by IN ('initiator', 'recipient'));

-- Add indexes for better performance
CREATE INDEX idx_offer_negotiation_round ON real_estate_offer(negotiation_round);
CREATE INDEX idx_offer_last_action_by ON real_estate_offer(last_action_by);
CREATE INDEX idx_offer_last_action_at ON real_estate_offer(last_action_at);
CREATE INDEX idx_offer_status_round ON real_estate_offer(offer_status, negotiation_round);
```

### **2. Create the `real_estate_offer_action` Table**

This table tracks all actions taken on offers:

```sql
-- Create the offer action tracking table
CREATE TABLE real_estate_offer_action (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  offer_id INTEGER NOT NULL REFERENCES real_estate_offer(id) ON DELETE CASCADE,
  offer_key VARCHAR(255) NOT NULL,
  property_uuid UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Action-specific data (stored as JSONB for flexibility)
  action_data JSONB,
  
  -- Constraints
  CONSTRAINT fk_offer_action_offer FOREIGN KEY (offer_id) REFERENCES real_estate_offer(id) ON DELETE CASCADE,
  CONSTRAINT check_action_valid CHECK (action IN (
    'INITIATOR_CREATED', 'INITIATOR_EDITED', 'INITIATOR_CANCELLED', 'INITIATOR_ACCEPTED', 'INITIATOR_COUNTERED', 'INITIATOR_REJECTED',
    'RECIPIENT_CREATED', 'RECIPIENT_EDITED', 'RECIPIENT_CANCELLED', 'RECIPIENT_ACCEPTED', 'RECIPIENT_COUNTERED', 'RECIPIENT_REJECTED'
  ))
);

-- Add indexes
CREATE INDEX idx_offer_action_offer_id ON real_estate_offer_action(offer_id);
CREATE INDEX idx_offer_action_offer_key ON real_estate_offer_action(offer_key);
CREATE INDEX idx_offer_action_property_uuid ON real_estate_offer_action(property_uuid);
CREATE INDEX idx_offer_action_action ON real_estate_offer_action(action);
CREATE INDEX idx_offer_action_created_at ON real_estate_offer_action(created_at);

-- Add trigger to automatically update updated_at on offer changes
CREATE OR REPLACE FUNCTION update_offer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_real_estate_offer_updated_at 
    BEFORE UPDATE ON real_estate_offer 
    FOR EACH ROW 
    EXECUTE FUNCTION update_offer_updated_at();
```

### **3. Update Offer Status Values**

Update the existing offer status values to support the new workflow:

```sql
-- Update existing offers to use new status values
UPDATE real_estate_offer 
SET offer_status = 'pending' 
WHERE offer_status = 'pending' OR offer_status IS NULL;

-- Add check constraint for valid status values
ALTER TABLE real_estate_offer 
ADD CONSTRAINT check_offer_status 
CHECK (offer_status IN ('pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'expired', 'completed'));
```

---

## 🔄 **Business Logic Implementation**

### **Negotiation Workflow Rules**

The system implements these business rules:

1. **Initial Offer** (Round 0)
   - User creates offer → `INITIATOR_CREATED`
   - Landlord can: Accept, Reject, Counter, or Withdraw

2. **First Counter** (Round 1)
   - Landlord counters → `RECIPIENT_COUNTERED`
   - User can: Accept, Reject, or Counter (final time)

3. **Final Counter** (Round 2)
   - User counters → `INITIATOR_COUNTERED`
   - Landlord can only: Accept or Reject

4. **Deal Ends When**
   - Either party accepts
   - Either party rejects
   - User withdraws
   - Maximum rounds reached

### **Status Transitions**

```sql
-- Valid status transitions
CREATE OR REPLACE FUNCTION validate_offer_status_transition(
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  negotiation_round INTEGER,
  action_type VARCHAR(50)
) RETURNS BOOLEAN AS $$
BEGIN
  -- Initial offer creation
  IF old_status IS NULL AND new_status = 'pending' THEN
    RETURN TRUE;
  END IF;
  
  -- From pending
  IF old_status = 'pending' THEN
    IF new_status IN ('accepted', 'rejected', 'countered', 'withdrawn') THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- From countered
  IF old_status = 'countered' THEN
    IF new_status IN ('accepted', 'rejected', 'countered') AND negotiation_round < 2 THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- From accepted/rejected/withdrawn (final states)
  IF old_status IN ('accepted', 'rejected', 'withdrawn') THEN
    RETURN FALSE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 **API Endpoints to Create**

After updating the database, you'll need these new API endpoints:

1. **`/api/v1/offers/accept-offer`** - Accept an offer
2. **`/api/v1/offers/reject-offer`** - Reject an offer
3. **`/api/v1/offers/counter-offer`** - Counter an offer
4. **`/api/v1/offers/withdraw-offer`** - Withdraw an offer
5. **`/api/v1/offers/get-offer-actions`** - Get action history
6. **`/api/v1/offers/get-negotiation-state`** - Get current negotiation state

---

## 📊 **Example Data Flow**

### **Scenario: Tenant → Landlord → Tenant → Landlord**

```
Round 0: Tenant creates offer
├── Status: pending
├── Action: INITIATOR_CREATED
└── Next: Landlord's turn

Round 1: Landlord counters
├── Status: countered  
├── Action: RECIPIENT_COUNTERED
├── Current values updated
└── Next: Tenant's turn

Round 2: Tenant counters (final)
├── Status: countered
├── Action: INITIATOR_COUNTERED  
├── Current values updated
└── Next: Landlord's final decision

Final: Landlord accepts/rejects
├── Status: accepted/rejected
├── Action: RECIPIENT_ACCEPTED/RECIPIENT_REJECTED
└── Deal ends
```

---

## 🔧 **Testing the Setup**

After running the SQL commands, test with:

```sql
-- Check table structure
\d real_estate_offer
\d real_estate_offer_action

-- Verify constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'real_estate_offer';

-- Test data insertion
INSERT INTO real_estate_offer_action (
  action, offer_id, offer_key, property_uuid, action_data
) VALUES (
  'INITIATOR_CREATED', 
  1, 
  'test_offer_key', 
  '123e4567-e89b-12d3-a456-426614174000',
  '{"message": "Test offer created"}'
);
```

---

## ⚠️ **Important Notes**

1. **Backup your database** before running these changes
2. **Test in development** environment first
3. **Update your GraphQL schema** in Hasura after table changes
4. **Migrate existing data** carefully to avoid data loss
5. **Update frontend components** to use new fields

---

## 🎯 **Next Steps**

After database setup:
1. ✅ Update API endpoints
2. ✅ Create negotiation logic
3. ✅ Update frontend components
4. ✅ Test negotiation workflow
5. ✅ Deploy to production

This system will provide a professional, transparent negotiation experience for your users! 🏠✨
