require 'test_helper'

class SubjectControllerTest < ActionController::TestCase
  test "should get courses" do
    get :courses
    assert_response :success
  end

end
