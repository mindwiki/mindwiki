require File.dirname(__FILE__) + '/../test_helper'

class UserTest < Test::Unit::TestCase
  fixtures :users

  def test_should_create_user
    assert_difference 'User.count' do
      user = create_user
      assert !user.new_record?, "#{user.errors.full_messages.to_sentence}"
    end
  end

  def test_should_require_login
    assert_no_difference 'User.count' do
      u = create_user(:login => nil)
      assert u.errors.on(:login)
    end
  end

  def test_should_require_password
    assert_no_difference 'User.count' do
      u = create_user(:password => nil)
      assert u.errors.on(:password)
    end
  end

  def test_should_require_password_confirmation
    assert_no_difference 'User.count' do
      u = create_user(:password_confirmation => nil)
      assert u.errors.on(:password_confirmation)
    end
  end

  def test_should_require_email
    assert_no_difference 'User.count' do
      u = create_user(:email => nil)
      assert u.errors.on(:email)
    end
  end

  def test_should_reset_password
    users(:mwiki).update_attributes(:password => 'new password', :password_confirmation => 'new password')
    assert_equal users(:mwiki), User.authenticate('mwiki', 'new password')
  end

  def test_should_not_rehash_password
    users(:mwiki).update_attributes(:login => 'quentin2')
    assert_equal users(:mwiki), User.authenticate('quentin2', 'mwiki')
  end

  def test_should_authenticate_user
    assert_equal users(:mwiki), User.authenticate('mwiki', 'mwiki')
  end

  def test_should_set_remember_token
    users(:mwiki).remember_me
    assert_not_nil users(:mwiki).remember_token
    assert_not_nil users(:mwiki).remember_token_expires_at
  end

  def test_should_unset_remember_token
    users(:mwiki).remember_me
    assert_not_nil users(:mwiki).remember_token
    users(:mwiki).forget_me
    assert_nil users(:mwiki).remember_token
  end

  def test_should_remember_me_for_one_week
    before = 1.week.from_now.utc
    users(:mwiki).remember_me_for 1.week
    after = 1.week.from_now.utc
    assert_not_nil users(:mwiki).remember_token
    assert_not_nil users(:mwiki).remember_token_expires_at
    assert users(:mwiki).remember_token_expires_at.between?(before, after)
  end

  def test_should_remember_me_until_one_week
    time = 1.week.from_now.utc
    users(:mwiki).remember_me_until time
    assert_not_nil users(:mwiki).remember_token
    assert_not_nil users(:mwiki).remember_token_expires_at
    assert_equal users(:mwiki).remember_token_expires_at, time
  end

  def test_should_remember_me_default_two_weeks
    before = 2.weeks.from_now.utc
    users(:mwiki).remember_me
    after = 2.weeks.from_now.utc
    assert_not_nil users(:mwiki).remember_token
    assert_not_nil users(:mwiki).remember_token_expires_at
    assert users(:mwiki).remember_token_expires_at.between?(before, after)
  end

protected
  def create_user(options = {})
    record = User.new({ :login => 'quire', :email => 'quire@example.com', :password => 'quire', :password_confirmation => 'quire' }.merge(options))
    record.save
    record
  end
end
