require 'test_helper'

class EdgesControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_redirected_to "/session/new"
    #assert_response :success
    #assert_not_nil assigns(:edges)
  end

  test "should get new" do
    get :new
    assert_redirected_to "/session/new"
    #assert_response :success
  end

#  test "should create edge" do
#    assert_difference('Edge.count') do
#      post :create, :edge => { }
#    end
#
#    assert_redirected_to edge_path(assigns(:edge))
#  end

#  test "should show edge" do
#    get :show, :id => edges(:one).id
#    assert_response :success
#  end

#  test "should get edit" do
#    get :edit, :id => edges(:one).id
#    assert_response :success
#  end

#  test "should update edge" do
#    put :update, :id => edges(:one).id, :edge => { }
#    assert_redirected_to edge_path(assigns(:edge))
#  end

#  test "should destroy edge" do
#    assert_difference('Edge.count', -1) do
#      delete :destroy, :id => edges(:one).id
#    end
#
#    assert_redirected_to edges_path
#  end
end
