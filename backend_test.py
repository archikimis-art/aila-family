#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Genealogy Tree Application
Tests all endpoints including preview mode, authentication, CRUD operations, and GDPR compliance
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BASE_URL = "https://roots-connect-3.preview.emergentagent.com/api"
TIMEOUT = 30

class GenealogyAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        self.auth_token = None
        self.test_user_email = f"ahmed.benali.{uuid.uuid4().hex[:8]}@gmail.com"
        self.test_results = []
        
    def log_result(self, test_name, success, details="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response"] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n=== TESTING HEALTH ENDPOINTS ===")
        
        # Test root endpoint
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "version" in data and "message" in data:
                    self.log_result("Health Check - Root", True, f"Version: {data.get('version')}")
                else:
                    self.log_result("Health Check - Root", False, "Missing version or message in response")
            else:
                self.log_result("Health Check - Root", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Health Check - Root", False, f"Exception: {str(e)}")
            
        # Test health endpoint
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("Health Check - Status", True, "API is healthy")
                else:
                    self.log_result("Health Check - Status", False, f"Unexpected status: {data.get('status')}")
            else:
                self.log_result("Health Check - Status", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Health Check - Status", False, f"Exception: {str(e)}")
    
    def test_preview_mode(self):
        """Test preview mode functionality"""
        print("\n=== TESTING PREVIEW MODE ===")
        
        # Create preview session
        try:
            response = self.session.post(f"{self.base_url}/preview/session")
            if response.status_code == 200:
                data = response.json()
                session_token = data.get("session_token")
                if session_token:
                    self.log_result("Preview Session Creation", True, f"Token: {session_token[:8]}...")
                    self.preview_token = session_token
                else:
                    self.log_result("Preview Session Creation", False, "No session token in response")
                    return
            else:
                self.log_result("Preview Session Creation", False, f"Status: {response.status_code}")
                return
        except Exception as e:
            self.log_result("Preview Session Creation", False, f"Exception: {str(e)}")
            return
            
        # Get preview session
        try:
            response = self.session.get(f"{self.base_url}/preview/{self.preview_token}")
            if response.status_code == 200:
                data = response.json()
                if "persons" in data and "links" in data:
                    self.log_result("Get Preview Session", True, f"Empty session retrieved successfully")
                else:
                    self.log_result("Get Preview Session", False, "Missing persons or links in response")
            else:
                self.log_result("Get Preview Session", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get Preview Session", False, f"Exception: {str(e)}")
            
        # Add person to preview
        person_data = {
            "first_name": "Fatima",
            "last_name": "Benaissa",
            "gender": "female",
            "birth_place": "Alger",
            "algerian_branch": "Alger"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/preview/{self.preview_token}/person", 
                                       json=person_data)
            if response.status_code == 200:
                data = response.json()
                if len(data.get("persons", [])) == 1:
                    self.log_result("Add Person to Preview", True, "Person added successfully")
                    self.preview_person_id = data["persons"][0]["id"]
                else:
                    self.log_result("Add Person to Preview", False, "Person not added correctly")
            else:
                self.log_result("Add Person to Preview", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Add Person to Preview", False, f"Exception: {str(e)}")
            
        # Test preview limit (add 10 more persons to test limit)
        for i in range(10):
            person_data = {
                "first_name": f"Person{i}",
                "last_name": "TestFamily",
                "gender": "male" if i % 2 == 0 else "female"
            }
            try:
                response = self.session.post(f"{self.base_url}/preview/{self.preview_token}/person", 
                                           json=person_data)
                if i == 9:  # Should fail on 11th person
                    if response.status_code == 400:
                        self.log_result("Preview Limit Test", True, "Correctly rejected 11th person")
                    else:
                        self.log_result("Preview Limit Test", False, f"Should have rejected 11th person, got: {response.status_code}")
            except Exception as e:
                if i == 9:
                    self.log_result("Preview Limit Test", False, f"Exception on limit test: {str(e)}")
    
    def test_authentication(self):
        """Test user registration and login"""
        print("\n=== TESTING AUTHENTICATION ===")
        
        # Test registration
        user_data = {
            "email": self.test_user_email,
            "password": "SecurePass123!",
            "first_name": "Ahmed",
            "last_name": "Ben Ali",
            "gdpr_consent": True
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=user_data)
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.log_result("User Registration", True, f"User registered: {data['user']['email']}")
                else:
                    self.log_result("User Registration", False, "Missing token or user in response")
                    return
            else:
                self.log_result("User Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return
        except Exception as e:
            self.log_result("User Registration", False, f"Exception: {str(e)}")
            return
            
        # Test login
        login_data = {
            "email": self.test_user_email,
            "password": "SecurePass123!"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.auth_token = data["access_token"]
                    self.log_result("User Login", True, "Login successful")
                else:
                    self.log_result("User Login", False, "No access token in response")
            else:
                self.log_result("User Login", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("User Login", False, f"Exception: {str(e)}")
            
        # Test get current user
        if self.auth_token:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            try:
                response = self.session.get(f"{self.base_url}/auth/me", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("email") == self.test_user_email:
                        self.log_result("Get Current User", True, f"User info retrieved: {data['first_name']} {data['last_name']}")
                    else:
                        self.log_result("Get Current User", False, "Email mismatch in user info")
                else:
                    self.log_result("Get Current User", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Get Current User", False, f"Exception: {str(e)}")
    
    def test_person_crud(self):
        """Test person CRUD operations"""
        print("\n=== TESTING PERSON CRUD ===")
        
        if not self.auth_token:
            self.log_result("Person CRUD", False, "No auth token available")
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Create person
        person_data = {
            "first_name": "Youcef",
            "last_name": "Boudjelal",
            "gender": "male",
            "birth_date": "1985-03-15",
            "birth_place": "Constantine",
            "algerian_branch": "Constantine",
            "notes": "Ingénieur informatique"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/persons", json=person_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data.get("first_name") == "Youcef":
                    self.person_id = data["id"]
                    self.log_result("Create Person", True, f"Person created with ID: {self.person_id}")
                else:
                    self.log_result("Create Person", False, "Invalid person data in response")
                    return
            else:
                self.log_result("Create Person", False, f"Status: {response.status_code}, Response: {response.text}")
                return
        except Exception as e:
            self.log_result("Create Person", False, f"Exception: {str(e)}")
            return
            
        # Get all persons
        try:
            response = self.session.get(f"{self.base_url}/persons", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 1:
                    self.log_result("Get All Persons", True, f"Retrieved {len(data)} persons")
                else:
                    self.log_result("Get All Persons", False, "No persons found or invalid format")
            else:
                self.log_result("Get All Persons", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get All Persons", False, f"Exception: {str(e)}")
            
        # Get single person
        try:
            response = self.session.get(f"{self.base_url}/persons/{self.person_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == self.person_id:
                    self.log_result("Get Single Person", True, f"Person retrieved: {data['first_name']} {data['last_name']}")
                else:
                    self.log_result("Get Single Person", False, "Person ID mismatch")
            else:
                self.log_result("Get Single Person", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get Single Person", False, f"Exception: {str(e)}")
            
        # Update person
        update_data = {
            "notes": "Ingénieur informatique - Spécialiste en IA",
            "birth_place": "Constantine, Algérie"
        }
        
        try:
            response = self.session.put(f"{self.base_url}/persons/{self.person_id}", 
                                      json=update_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if "Spécialiste en IA" in data.get("notes", ""):
                    self.log_result("Update Person", True, "Person updated successfully")
                else:
                    self.log_result("Update Person", False, "Update not reflected in response")
            else:
                self.log_result("Update Person", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Update Person", False, f"Exception: {str(e)}")
    
    def test_family_links(self):
        """Test family link CRUD operations"""
        print("\n=== TESTING FAMILY LINKS ===")
        
        if not self.auth_token or not hasattr(self, 'person_id'):
            self.log_result("Family Links", False, "No auth token or person ID available")
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Create second person for linking
        person_data = {
            "first_name": "Amina",
            "last_name": "Boudjelal",
            "gender": "female",
            "birth_date": "1987-07-22",
            "birth_place": "Constantine",
            "algerian_branch": "Constantine"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/persons", json=person_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.person_id_2 = data["id"]
                self.log_result("Create Second Person for Link", True, f"Person created: {data['first_name']}")
            else:
                self.log_result("Create Second Person for Link", False, f"Status: {response.status_code}")
                return
        except Exception as e:
            self.log_result("Create Second Person for Link", False, f"Exception: {str(e)}")
            return
            
        # Create family link
        link_data = {
            "person_id_1": self.person_id,
            "person_id_2": self.person_id_2,
            "link_type": "spouse"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/links", json=link_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data.get("link_type") == "spouse":
                    self.link_id = data["id"]
                    self.log_result("Create Family Link", True, f"Link created: {data['link_type']}")
                else:
                    self.log_result("Create Family Link", False, "Invalid link data in response")
                    return
            else:
                self.log_result("Create Family Link", False, f"Status: {response.status_code}, Response: {response.text}")
                return
        except Exception as e:
            self.log_result("Create Family Link", False, f"Exception: {str(e)}")
            return
            
        # Get all links
        try:
            response = self.session.get(f"{self.base_url}/links", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 1:
                    self.log_result("Get All Links", True, f"Retrieved {len(data)} links")
                else:
                    self.log_result("Get All Links", False, "No links found or invalid format")
            else:
                self.log_result("Get All Links", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get All Links", False, f"Exception: {str(e)}")
            
        # Delete link
        try:
            response = self.session.delete(f"{self.base_url}/links/{self.link_id}", headers=headers)
            if response.status_code == 200:
                self.log_result("Delete Family Link", True, "Link deleted successfully")
            else:
                self.log_result("Delete Family Link", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Delete Family Link", False, f"Exception: {str(e)}")
    
    def test_tree_endpoint(self):
        """Test tree endpoint"""
        print("\n=== TESTING TREE ENDPOINT ===")
        
        if not self.auth_token:
            self.log_result("Tree Endpoint", False, "No auth token available")
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = self.session.get(f"{self.base_url}/tree", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if "persons" in data and "links" in data:
                    persons_count = len(data["persons"])
                    links_count = len(data["links"])
                    self.log_result("Get Tree", True, f"Tree retrieved: {persons_count} persons, {links_count} links")
                else:
                    self.log_result("Get Tree", False, "Missing persons or links in tree response")
            else:
                self.log_result("Get Tree", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get Tree", False, f"Exception: {str(e)}")
    
    def test_gdpr_export(self):
        """Test GDPR data export"""
        print("\n=== TESTING GDPR EXPORT ===")
        
        if not self.auth_token:
            self.log_result("GDPR Export", False, "No auth token available")
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = self.session.get(f"{self.base_url}/gdpr/export", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if "user" in data and "persons" in data and "family_links" in data:
                    user_email = data["user"].get("email")
                    if user_email == self.test_user_email:
                        self.log_result("GDPR Export", True, f"Data exported for user: {user_email}")
                    else:
                        self.log_result("GDPR Export", False, "Email mismatch in exported data")
                else:
                    self.log_result("GDPR Export", False, "Missing required fields in export")
            else:
                self.log_result("GDPR Export", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("GDPR Export", False, f"Exception: {str(e)}")
    
    def cleanup_test_person(self):
        """Clean up test data"""
        print("\n=== CLEANUP ===")
        
        if not self.auth_token or not hasattr(self, 'person_id'):
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Delete test persons
        for person_id in [getattr(self, 'person_id', None), getattr(self, 'person_id_2', None)]:
            if person_id:
                try:
                    response = self.session.delete(f"{self.base_url}/persons/{person_id}", headers=headers)
                    if response.status_code == 200:
                        self.log_result("Cleanup Person", True, f"Person {person_id} deleted")
                except Exception as e:
                    self.log_result("Cleanup Person", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🧪 Starting Genealogy API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"📧 Test User: {self.test_user_email}")
        print("=" * 60)
        
        # Run tests in logical order
        self.test_health_endpoints()
        self.test_preview_mode()
        self.test_authentication()
        self.test_person_crud()
        self.test_family_links()
        self.test_tree_endpoint()
        self.test_gdpr_export()
        self.cleanup_test_person()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.test_results if r["success"])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n🚨 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
        
        return self.test_results

if __name__ == "__main__":
    tester = GenealogyAPITester()
    results = tester.run_all_tests()